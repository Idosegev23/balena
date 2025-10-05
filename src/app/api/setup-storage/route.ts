import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    // Create admin client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Create business-cards bucket if it doesn't exist
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('Error listing buckets:', listError)
      return NextResponse.json({ error: 'Failed to list buckets' }, { status: 500 })
    }

    const businessCardsBucket = buckets?.find(bucket => bucket.name === 'business-cards')
    
    if (!businessCardsBucket) {
      const { data, error } = await supabase.storage.createBucket('business-cards', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        fileSizeLimit: 10485760 // 10MB
      })

      if (error) {
        console.error('Error creating business-cards bucket:', error)
        return NextResponse.json({ error: 'Failed to create bucket' }, { status: 500 })
      }

      console.log('Business cards bucket created:', data)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Storage setup completed',
      bucketExists: !!businessCardsBucket
    })
  } catch (error) {
    console.error('Storage setup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
