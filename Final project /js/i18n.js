(() => {
  const KEY_LANG = "et_lang_v3";
  const DEFAULT_LANG = "en";

  const dict = {
    en: {
      appTitle: "Expense Tracker",
      landingTag: "Smart tracking • Clear insights",
      landingHeadline: "Track your spending smarter",
      landingText: "Add expenses in seconds, see your monthly total, and view simple insights.",
      landingB1: "Add expenses fast (amount, category, date)",
      landingB2: "Search + simple filters",
      landingB3: "Charts and budget warning",
      landingB4: "Currency conversion via external API",
      landingPrivacyTitle: "Privacy",
      landingPrivacyText: "Your data stays on your device (localStorage).",
      landingTipTitle: "Tip",
      landingTipText: "Set a monthly budget to get a simple warning when you get close.",

      skip: "Skip to content",
      language: "Language",
      menu: "Menu",

      accessibility: "Accessibility",
      biggerText: "Bigger text",
      highContrast: "High contrast",
      underlineLinks: "Underline links",
      a11yReset: "Reset",

      login: "Login",
      register: "Create account",
      logout: "Logout",
      email: "Email",
      password: "Password",
      fullName: "Full name",
      noAccount: "No account?",
      haveAccount: "Already have an account?",

      personalDetails: "Personal Details",
      deleteAll: "Delete All Data",

      quickAddTitle: "Add expense",
      tabList: "List",
      tabInsights: "Insights",

      month: "Month:",
      currentMonthLabel: "Current month",
      lockedMonth: "Locked (view only)",
      lockedHint: "This month is locked (view only).",

      amount: "Amount",
      date: "Date",
      payType: "Payment Type",
      category: "Category",
      descOpt: "Description (optional)",
      save: "Save",
      cancelEdit: "Cancel Edit",
      choose: "Choose...",

      payCash: "Cash",
      payCredit: "Credit",
      payCheck: "Check",

      catClothes: "Clothes",
      catEntertainment: "Entertainment",
      catFuel: "Fuel",
      catFood: "Food",
      catBills: "Bills",
      catHealth: "Health",
      catEducation: "Education",
      catOther: "Other",

      count: "Count",
      monthSpent: "Spent",
      monthRemaining: "Remaining",
      displayTotal: "In currency",
      listTitle: "Expenses",
      emptyState: "No expenses yet. Add your first one.",

      search: "Search",
      searchPH: "Search by description...",
      filters: "Filters",
      allPay: "All payment types",
      allCat: "All categories",
      from: "From",
      to: "To",
      sort: "Sort",
      sortNew: "Newest first",
      sortOld: "Oldest first",
      sortHigh: "Highest amount",
      sortLow: "Lowest amount",
      clearFilters: "Clear filters",

      thDate: "Date",
      thAmount: "Amount",
      thPay: "Payment",
      thCat: "Category",
      thDesc: "Description",
      thActions: "Actions",

      edit: "Edit",
      del: "Delete",

      budgetTitle: "Monthly Budget",
      budgetPH: "e.g. 2000",
      saveBudget: "Save Budget",

      currencyTitle: "Currency & Conversion (External API)",
      refreshRates: "Refresh rates",
      showIn: "Show amounts in:",

      chartCat: "Chart: by Category",
      chartPay: "Chart: by Payment Type",

      msgConfirmDeleteAll: "Are you sure? This will delete all your data.",
      msgConfirmDeleteOne: "Delete this expense?",
      msgRatesOk: "Rates updated successfully.",
      msgRatesFail: "Could not update rates. Will show without conversion if needed.",
      msgBudgetInvalid: "Budget must be a valid number (0 or more).",
      msgLoginFail: "Invalid email or password.",
      msgRegisterFail: "Registration failed. Email may already exist.",
      msgNeedLogin: "Please login first.",
      msgPossibleDup: "This looks like a duplicate. Add anyway?",

      errMissing: "Missing data.",
      errAmountReq: "Amount is required.",
      errDateReq: "Date is required.",
      errPayReq: "Payment type is required.",
      errCatReq: "Category is required.",
      errAmountNum: "Amount must be a number.",
      errDateInvalid: "Invalid date.",
      errAmountMin: "Amount must be greater than 0.",
      errAmountMax: "Amount is too large.",
      errFutureDate: "Future dates are not allowed.",
      errDecimals: "Max 2 decimal places allowed.",
      errDescLen: "Description too long (max 60)."
    },

    ar: {
      appTitle: "نظام تتبّع المصروفات",
      landingTag: "تتبّع ذكي • رؤية أوضح",
      landingHeadline: "تتبّع صرفك بذكاء",
      landingText: "سجّل مصروفاتك بسرعة، شاهد مجموع الشهر، واعرض مؤشرات بسيطة.",
      landingB1: "إضافة المصروف بسرعة (المبلغ، الفئة، التاريخ)",
      landingB2: "بحث + فلاتر بسيطة",
      landingB3: "رسوم بيانية + تنبيه الميزانية",
      landingB4: "تحويل عملات عبر API خارجي",
      landingPrivacyTitle: "الخصوصية",
      landingPrivacyText: "بياناتك تبقى على جهازك (localStorage).",
      landingTipTitle: "نصيحة",
      landingTipText: "حدد ميزانية شهرية لتحصل على تنبيه بسيط عند الاقتراب منها.",

      skip: "تخطي إلى المحتوى",
      language: "اللغة",
      menu: "القائمة",

      accessibility: "إمكانية الوصول",
      biggerText: "تكبير الخط",
      highContrast: "تباين قوي",
      underlineLinks: "تسطير الروابط",
      a11yReset: "إرجاع للوضع الافتراضي",

      login: "تسجيل دخول",
      register: "إنشاء حساب",
      logout: "تسجيل خروج",
      email: "الإيميل",
      password: "كلمة المرور",
      fullName: "الاسم الكامل",
      noAccount: "ما عندك حساب؟",
      haveAccount: "عندك حساب؟",

      personalDetails: "التفاصيل الشخصية",
      deleteAll: "حذف كل البيانات",

      quickAddTitle: "إضافة مصروف",
      tabList: "القائمة",
      tabInsights: "إحصائيات",

      month: "الشهر:",
      currentMonthLabel: "الشهر الحالي",
      lockedMonth: "مغلق (عرض فقط)",
      lockedHint: "هذا الشهر مغلق (عرض فقط).",

      amount: "المبلغ",
      date: "التاريخ",
      payType: "نوع الدفع",
      category: "الفئة",
      descOpt: "وصف (اختياري)",
      save: "حفظ",
      cancelEdit: "إلغاء التعديل",
      choose: "اختر...",

      payCash: "نقدي",
      payCredit: "بطاقة",
      payCheck: "شيك",

      catClothes: "ملابس",
      catEntertainment: "ترفيه",
      catFuel: "وقود",
      catFood: "طعام",
      catBills: "فواتير",
      catHealth: "صحة",
      catEducation: "تعليم",
      catOther: "أخرى",

      count: "العدد",
      monthSpent: "المصروف",
      monthRemaining: "المتبقي",
      displayTotal: "حسب العملة",
      listTitle: "المصروفات",
      emptyState: "لا توجد مصروفات بعد. أضف أول مصروف.",

      search: "بحث",
      searchPH: "ابحث بالوصف...",
      filters: "فلاتر",
      allPay: "كل أنواع الدفع",
      allCat: "كل الفئات",
      from: "من",
      to: "إلى",
      sort: "فرز",
      sortNew: "الأحدث أولاً",
      sortOld: "الأقدم أولاً",
      sortHigh: "الأعلى مبلغاً",
      sortLow: "الأقل مبلغاً",
      clearFilters: "مسح الفلاتر",

      thDate: "تاريخ",
      thAmount: "المبلغ",
      thPay: "الدفع",
      thCat: "الفئة",
      thDesc: "وصف",
      thActions: "إجراءات",

      edit: "تعديل",
      del: "حذف",

      budgetTitle: "الميزانية الشهرية",
      budgetPH: "مثال: 2000",
      saveBudget: "حفظ الميزانية",

      currencyTitle: "العملة والتحويل (API خارجي)",
      refreshRates: "تحديث الأسعار",
      showIn: "اعرض المبالغ بعملة:",

      chartCat: "الرسم: حسب الفئة",
      chartPay: "الرسم: حسب نوع الدفع",

      msgConfirmDeleteAll: "هل أنت متأكد؟ سيتم حذف كل بياناتك.",
      msgConfirmDeleteOne: "حذف هذا المصروف؟",
      msgRatesOk: "تم تحديث أسعار الصرف بنجاح.",
      msgRatesFail: "تعذر تحديث أسعار الصرف. سيتم العرض بدون تحويل إذا لزم.",
      msgBudgetInvalid: "الميزانية يجب أن تكون رقمًا صالحًا (0 أو أكثر).",
      msgLoginFail: "بيانات الدخول غير صحيحة.",
      msgRegisterFail: "فشل إنشاء الحساب. ربما الإيميل موجود.",
      msgNeedLogin: "لازم تسجل دخول أولاً.",
      msgPossibleDup: "يبدو أنه مصروف مكرر. هل تريد الإضافة؟",

      errMissing: "بيانات ناقصة.",
      errAmountReq: "المبلغ مطلوب.",
      errDateReq: "التاريخ مطلوب.",
      errPayReq: "نوع الدفع مطلوب.",
      errCatReq: "الفئة مطلوبة.",
      errAmountNum: "المبلغ يجب أن يكون رقمًا.",
      errDateInvalid: "تاريخ غير صالح.",
      errAmountMin: "المبلغ يجب أن يكون أكبر من 0.",
      errAmountMax: "المبلغ كبير جدًا.",
      errFutureDate: "لا يسمح بتاريخ في المستقبل.",
      errDecimals: "يسمح فقط حتى منزلتين عشريتين.",
      errDescLen: "الوصف طويل (الحد 60)."
    },

    he: {
      appTitle: "מערכת מעקב הוצאות",
      landingTag: "מעקב חכם • תובנות ברורות",
      landingHeadline: "עקוב אחרי ההוצאות בצורה חכמה",
      landingText: "הוסף הוצאות במהירות, ראה את סך החודש והצג תובנות פשוטות.",
      landingB1: "הוספה מהירה (סכום, קטגוריה, תאריך)",
      landingB2: "חיפוש + מסננים פשוטים",
      landingB3: "גרפים + התראת תקציב",
      landingB4: "המרת מטבע באמצעות API חיצוני",
      landingPrivacyTitle: "פרטיות",
      landingPrivacyText: "הנתונים נשמרים אצלך במכשיר (localStorage).",
      landingTipTitle: "טיפ",
      landingTipText: "הגדר תקציב חודשי כדי לקבל התראה פשוטה כשמתקרבים אליו.",

      skip: "דלג לתוכן",
      language: "שפה",
      menu: "תפריט",

      accessibility: "נגישות",
      biggerText: "הגדלת טקסט",
      highContrast: "ניגודיות גבוהה",
      underlineLinks: "קו תחתי לקישורים",
      a11yReset: "איפוס",

      login: "התחברות",
      register: "יצירת חשבון",
      logout: "התנתקות",
      email: "אימייל",
      password: "סיסמה",
      fullName: "שם מלא",
      noAccount: "אין לך חשבון?",
      haveAccount: "כבר יש לך חשבון?",

      personalDetails: "פרטים אישיים",
      deleteAll: "מחק את כל הנתונים",

      quickAddTitle: "הוסף הוצאה",
      tabList: "רשימה",
      tabInsights: "תובנות",

      month: "חודש:",
      currentMonthLabel: "החודש הנוכחי",
      lockedMonth: "נעול (צפייה בלבד)",
      lockedHint: "החודש נעול (צפייה בלבד).",

      amount: "סכום",
      date: "תאריך",
      payType: "אמצעי תשלום",
      category: "קטגוריה",
      descOpt: "תיאור (אופציונלי)",
      save: "שמור",
      cancelEdit: "בטל עריכה",
      choose: "בחר...",

      payCash: "מזומן",
      payCredit: "אשראי",
      payCheck: "צ׳ק",

      catClothes: "בגדים",
      catEntertainment: "בילויים",
      catFuel: "דלק",
      catFood: "אוכל",
      catBills: "חשבונות",
      catHealth: "בריאות",
      catEducation: "חינוך",
      catOther: "אחר",

      count: "כמות",
      monthSpent: "הוצאת",
      monthRemaining: "נשאר",
      displayTotal: "לפי מטבע",
      listTitle: "הוצאות",
      emptyState: "אין הוצאות עדיין. הוסף את הראשונה.",

      search: "חיפוש",
      searchPH: "חפש לפי תיאור...",
      filters: "מסננים",
      allPay: "כל סוגי התשלום",
      allCat: "כל הקטגוריות",
      from: "מ־",
      to: "עד",
      sort: "מיון",
      sortNew: "החדשים קודם",
      sortOld: "הישנים קודם",
      sortHigh: "הסכום הגבוה",
      sortLow: "הסכום הנמוך",
      clearFilters: "נקה מסננים",

      thDate: "תאריך",
      thAmount: "סכום",
      thPay: "תשלום",
      thCat: "קטגוריה",
      thDesc: "תיאור",
      thActions: "פעולות",

      edit: "ערוך",
      del: "מחק",

      budgetTitle: "תקציב חודשי",
      budgetPH: "לדוגמה: 2000",
      saveBudget: "שמור תקציב",

      currencyTitle: "מטבע והמרה (API חיצוני)",
      refreshRates: "רענן שערים",
      showIn: "הצג סכומים ב:",

      chartCat: "גרף: לפי קטגוריה",
      chartPay: "גרף: לפי אמצעי תשלום",

      msgConfirmDeleteAll: "בטוח? פעולה זו תמחק את כל הנתונים שלך.",
      msgConfirmDeleteOne: "למחוק הוצאה זו?",
      msgRatesOk: "השערים עודכנו בהצלחה.",
      msgRatesFail: "לא ניתן לעדכן שערים. יוצג ללא המרה אם צריך.",
      msgBudgetInvalid: "התקציב חייב להיות מספר תקין (0 ומעלה).",
      msgLoginFail: "אימייל או סיסמה שגויים.",
      msgRegisterFail: "הרשמה נכשלה. ייתכן שהאימייל קיים.",
      msgNeedLogin: "צריך להתחבר קודם.",
      msgPossibleDup: "נראה שזו הוצאה כפולה. להוסיף בכל זאת?",

      errMissing: "חסר מידע.",
      errAmountReq: "נדרש סכום.",
      errDateReq: "נדרש תאריך.",
      errPayReq: "נדרש אמצעי תשלום.",
      errCatReq: "נדרשת קטגוריה.",
      errAmountNum: "הסכום חייב להיות מספר.",
      errDateInvalid: "תאריך לא תקין.",
      errAmountMin: "הסכום חייב להיות גדול מ-0.",
      errAmountMax: "הסכום גדול מדי.",
      errFutureDate: "אין לאפשר תאריך עתידי.",
      errDecimals: "מקסימום 2 ספרות אחרי הנקודה.",
      errDescLen: "התיאור ארוך מדי (מקסימום 60)."
    }
  };

  function getLang(){
    return localStorage.getItem(KEY_LANG) || DEFAULT_LANG;
  }

  function setLang(lang){
    localStorage.setItem(KEY_LANG, lang);
    applyLang();
  }

  function t(key){
    const lang = getLang();
    return (dict[lang] && dict[lang][key]) || dict.en[key] || key;
  }

  function applyLang(){
    const lang = getLang();
    const isRtl = (lang === "ar" || lang === "he");
    document.documentElement.lang = lang;
    document.documentElement.dir = isRtl ? "rtl" : "ltr";

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = t(el.getAttribute("data-i18n"));
    });

    document.querySelectorAll("[data-i18n-ph]").forEach((el) => {
      el.setAttribute("placeholder", t(el.getAttribute("data-i18n-ph")));
    });
  }

  window.I18N = { t, getLang, setLang, applyLang };
})();