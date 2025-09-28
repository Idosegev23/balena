import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role key for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Logo upload API called')
    
    // Get the form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const companyId = formData.get('companyId') as string
    const companyName = formData.get('companyName') as string

    if (!file || !companyId || !companyName) {
      console.log('❌ Missing required fields:', { file: !!file, companyId, companyName })
      return NextResponse.json(
        { error: 'Missing required fields: file, companyId, companyName' },
        { status: 400 }
      )
    }

    console.log('📁 Processing file:', {
      name: file.name,
      size: file.size,
      type: file.type,
      companyId,
      companyName
    })

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      )
    }

    // Create clean filename
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png'
    const companySlug = companyName.toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .slice(0, 50)
    const fileName = `logo_${companySlug}_${Date.now()}.${fileExt}`

    console.log('📤 Uploading to Supabase Storage:', fileName)

    // Convert file to buffer
    const fileBuffer = await file.arrayBuffer()
    const fileData = new Uint8Array(fileBuffer)

    // Upload to Supabase Storage using service role
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('company-logos')
      .upload(fileName, fileData, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('❌ Upload error:', uploadError)
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      )
    }

    console.log('✅ File uploaded successfully:', uploadData)

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('company-logos')
      .getPublicUrl(fileName)

    const logoUrl = urlData.publicUrl
    console.log('🔗 Generated public URL:', logoUrl)

    // Update company in database using service role
    const { data: updateData, error: updateError } = await supabaseAdmin
      .from('companies')
      .update({ 
        logo_url: logoUrl,
        logo: logoUrl,
        logo_file: fileName,
        updated_at: new Date().toISOString()
      })
      .eq('id', parseInt(companyId))
      .select()

    if (updateError) {
      console.error('❌ Database update error:', updateError)
      return NextResponse.json(
        { error: `Database update failed: ${updateError.message}` },
        { status: 500 }
      )
    }

    console.log('✅ Database updated successfully:', updateData)

    return NextResponse.json({
      success: true,
      logoUrl,
      fileName,
      message: 'Logo uploaded successfully!'
    })

  } catch (error: any) {
    console.error('❌ Server error:', error)
    return NextResponse.json(
      { error: `Server error: ${error.message}` },
      { status: 500 }
    )
  }
}
