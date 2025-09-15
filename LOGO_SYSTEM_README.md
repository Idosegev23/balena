# מערכת לוגואים - K-Show 2025

מערכת מושלמת לניהול לוגואי החברות הכוללת:
- 🤖 **סקרייפר אוטומטי** לחילוץ לוגואים מאתרי החברות
- 📤 **העלאה ידנית** של לוגואים דרך הממשק
- 🗄️ **אחסון מאובטח** ב-Supabase Storage
- 🎨 **אופטימיזציה אוטומטית** של התמונות

## 🚀 הפעלה מהירה

### 1. הכנת מסד הנתונים
```bash
# הרץ את הקובץ SQL ליצירת המבנה
psql -h your-supabase-host -d postgres -f logo_database_setup.sql
```

### 2. הגדרת Storage
```bash
# הכן את bucket ל-storage
python setup_logo_storage.py
```

### 3. הפעלת הסקרייפר
```bash
# התקנת dependencies (פעם אחת)
pip install -r requirements_scraper.txt

# סקרייפינג כל החברות ללא לוגו
python logo_scraper.py

# סקרייפינג 10 חברות ראשונות
python logo_scraper.py --limit 10

# סקרייפינג חברה ספציפית
python logo_scraper.py --company-id 123
```

## 📋 קבצים שנוצרו

### Python Scripts
- **`logo_scraper.py`** - סקרייפר מתקדם לחילוץ לוגואים
- **`setup_logo_storage.py`** - הגדרת Supabase Storage
- **`logo_database_setup.sql`** - הגדרת מסד הנתונים

### React Components  
- **`LogoUploader.tsx`** - רכיב להעלאת לוגואים ידנית
- **`LogoDisplay.tsx`** - רכיב להצגת לוגואים ברשימות

### שילובים ברכיבים קיימים
- **`CompanyModal.tsx`** - הוספת לוגו לכותרת + טאב ניהול לוגו
- **`CompanyDiscoveryPage.tsx`** - הצגת לוגואים ברשימת החברות

## 🎯 תכונות מתקדמות

### הסקרייפר
- **זיהוי חכם** של לוגואים באתרים
- **מערכת ניקוד** לבחירת הלוגו הטוב ביותר
- **תמיכה ב-SVG ו-PNG/JPG**
- **אופטימיזציה אוטומטית** של גודל ואיכות
- **Rate limiting** למניעת חסימות

### העלאה ידנית
- **Drag & Drop** תמיכה
- **אופטימיזציה אוטומטית** (400x200 מקסימום)
- **תמיכה בפורמטים** PNG, JPG, SVG, WebP
- **הצגת תצוגה מקדימה**
- **מחיקה ועריכה** של לוגואים קיימים

### אבטחה
- **RLS Policies** מובנות
- **אימות משתמשים** נדרש להעלאה
- **גבלת גודל קבצים** (5MB מקסימום)
- **סינון סוגי קבצים** בלבד תמונות

## 📊 נתונים סטטיסטיים

### פונקציות מסד נתונים
```sql
-- סטטיסטיקות לוגואים
SELECT * FROM get_logo_statistics();

-- חברות לפי סטטוס לוגו
SELECT logo_status, COUNT(*) 
FROM companies_logo_status 
GROUP BY logo_status;
```

### Views מועילים
- **`companies_logo_status`** - מצב לוגו לכל חברה
- **סטטוס אפשרי**: `has_logo`, `can_scrape`, `no_logo_source`

## 🛠️ שימוש ב-UI

### לוגו של חברה
1. **בכרטיס החברה** - לוגו מוצג אוטומטי בצד השם
2. **במודל החברה** - לוגו בכותרת
3. **בטאב "Company Info"** - ניהול מלא של הלוגו

### העלאת לוגו ידנית
1. פתח חברה במודל
2. עבור לטאב "Company Info"  
3. גלול למטה ל"Company Logo"
4. גרור קובץ או לחץ "Choose File"
5. הלוגו יעלה ויוצג אוטומטית

### הפעלת סקרייפר
```bash
# בדיקת חברות ללא לוגו
python logo_scraper.py --limit 5

# הפעלה מלאה (זהירות - עלול לקחת זמן)
python logo_scraper.py
```

## 🔧 תחזוקה

### ניקוי קבצים ישנים
```python
# TODO: הוסף סקריפט לניקוי קבצים שלא בשימוש
```

### מוניטורינג
- **לוגים**: `logo_scraper.log`
- **התקדמות**: הודעות בזמן אמת
- **שגיאות**: מדווחות ל-console ו-log

## 🎯 המשך פיתוח

### רעיונות לעתיד
- **AI Logo Detection** - זיהוי מתקדם יותר
- **Bulk Import** - העלאה המונית  
- **Logo Similarity** - זיהוי לוגואים דומים
- **Auto-Update** - עדכון אוטומטי של לוגואים ישנים

---

## 📞 תמיכה

לשאלות או בעיות:
1. בדוק את הלוגים: `logo_scraper.log`
2. הריץ: `python setup_logo_storage.py` לבדיקת הגדרות
3. ודא שיש הרשאות לכתיבה ב-Supabase Storage

**🎉 מערכת הלוגואים מוכנה לשימוש!**
