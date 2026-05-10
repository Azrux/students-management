export const t = {
  // App name and branding
  app: {
    name: "ClasesApp",
    tagline: "Gestiona tus clases de forma simple",
    description: "La plataforma ideal para profesores independientes",
  },

  // Navigation
  nav: {
    home: "Inicio",
    dashboard: "Panel",
    students: "Estudiantes",
    schedule: "Horario",
    payments: "Pagos",
    classes: "Clases",
    settings: "Configuración",
    profile: "Perfil",
    logout: "Cerrar Sesión",
    login: "Iniciar Sesión",
    signup: "Registrarse",
  },

  // Buttons (legacy keys kept for existing pages)
  buttons: {
    login: "Iniciar Sesión",
    signup: "Registrarse",
    save: "Guardar",
    cancel: "Cancelar",
    delete: "Eliminar",
    edit: "Editar",
    add: "Agregar",
    buyClasses: "Comprar Clases",
    createPlan: "Crear Plan",
    markAttended: "Marcar Asistencia",
    logout: "Cerrar Sesión",
  },

  // Common actions
  actions: {
    save: "Guardar",
    cancel: "Cancelar",
    delete: "Eliminar",
    edit: "Editar",
    add: "Agregar",
    create: "Crear",
    update: "Actualizar",
    search: "Buscar",
    filter: "Filtrar",
    close: "Cerrar",
    confirm: "Confirmar",
    back: "Volver",
    next: "Siguiente",
    previous: "Anterior",
    viewAll: "Ver todos",
    getStarted: "Comenzar",
    learnMore: "Saber más",
    buyClasses: "Comprar Clases",
    bookClass: "Reservar Clase",
    markAttended: "Marcar asistencia",
  },

  // Forms
  forms: {
    email: "Correo Electrónico",
    password: "Contraseña",
    confirmPassword: "Confirmar Contraseña",
    name: "Nombre",
    firstName: "Nombre",
    lastName: "Apellido",
    phone: "Teléfono",
    address: "Dirección",
    city: "Ciudad",
    country: "País",
    className: "Nombre de la Clase",
    description: "Descripción",
    durationMins: "Duración (minutos)",
    maxStudents: "Máximo de Estudiantes",
    planName: "Nombre del Plan",
    numClasses: "Cantidad de Clases",
    price: "Precio",
    validityDays: "Días de Validez",
    required: "Este campo es requerido",
    invalidEmail: "Correo electrónico inválido",
    passwordMinLength: "La contraseña debe tener al menos 8 caracteres",
  },

  // Auth
  auth: {
    loginTitle: "Iniciar Sesión",
    signupTitle: "Registrarse",
    studentRole: "Estudiante",
    teacherRole: "Profesor",
    selectRole: "Selecciona tu rol",
    noAccount: "¿No tienes cuenta?",
    haveAccount: "¿Ya tienes cuenta?",
    signupHere: "Regístrate aquí",
    loginHere: "Inicia sesión aquí",
    login: {
      title: "Iniciar Sesión",
      subtitle: "Ingresa a tu cuenta",
      noAccount: "¿No tienes cuenta?",
      forgotPassword: "¿Olvidaste tu contraseña?",
    },
    signup: {
      title: "Crear Cuenta",
      subtitle: "Registra tu cuenta de profesor o estudiante",
      hasAccount: "¿Ya tienes cuenta?",
      asTeacher: "Soy Profesor",
      asStudent: "Soy Estudiante",
    },
  },

  // Dashboard
  dashboard: {
    welcome: "Bienvenido",
    welcomeBack: "Bienvenido de nuevo",
    studentDashboard: "Panel del Estudiante",
    teacherDashboard: "Panel del Profesor",
    myClasses: "Mis Clases",
    myStudents: "Mis Estudiantes",
    mySchedule: "Mi Horario",
    myPayments: "Mis Pagos",
    overview: "Resumen",
    quickActions: "Acciones Rápidas",
    upcomingClasses: "Próximas Clases",
    todaySchedule: "Agenda de Hoy",
    noUpcomingClasses: "No hay clases programadas",
  },

  // Student
  student: {
    activePayments: "Planes Activos",
    myClasses: "Mis Clases",
    classesRemaining: (count: number) => `${count} clases restantes`,
    classesUsed: (used: number, total: number) => `${used} de ${total} clases utilizadas`,
    expiresOn: "Vence el",
    buyMoreClasses: "Comprar Más Clases",
    noActivePayments: "No tienes planes activos",
    teacherFreeSlots: "Horarios Disponibles del Profesor",
  },

  // Teacher
  teacher: {
    totalStudents: "Total de Estudiantes",
    activeClasses: "Clases Activas",
    totalEarnings: "Ingresos Totales",
    pendingPayments: "Pagos Pendientes",
    studentsList: "Lista de Estudiantes",
    paymentHistory: "Historial de Pagos",
    createClass: "Crear Clase",
    createPaymentPlan: "Crear Plan de Pago",
    noStudents: "No tienes estudiantes aún",
  },

  // Payments
  payments: {
    checkout: "Ir al Checkout",
    processing: "Procesando...",
    paymentSuccess: "¡Pago completado!",
    paymentFailed: "El pago falló",
    selectPlan: "Selecciona un Plan",
    planExpired: "Plan Vencido",
    recordPayment: "Registrar Pago",
    paidAt: "Pagado el",
    amount: "Monto",
    title: "Pagos",
    paymentHistory: "Historial de Pagos",
    totalRevenue: "Ingresos Totales",
    pendingPayments: "Pagos Pendientes",
  },

  // Admin
  admin: {
    tenants: "Profesores",
    settings: "Configuración",
    branding: "Marca",
    createTenant: "Crear Profesor",
    tenantName: "Nombre del Profesor",
    tenantEmail: "Email del Profesor",
    tenantSlug: "Slug (URL)",
    tenantTheme: "Tema",
  },

  // Messages
  messages: {
    loading: "Cargando...",
    noData: "Sin datos",
    success: "¡Éxito!",
    error: "Error",
    errorLoadingData: "Error al cargar los datos",
    confirmDelete: "¿Estás seguro de que deseas eliminar?",
    deleted: "Eliminado correctamente",
    saved: "Guardado correctamente",
  },

  // Branding
  branding: {
    primaryColor: "Color Principal",
    secondaryColor: "Color Secundario",
    accentColor: "Color de Acentos",
    backgroundColor: "Color de Fondo",
    textColor: "Color de Texto",
    logo: "Logo",
    uploadLogo: "Subir Logo",
    fontFamily: "Familia de Fuentes",
    tagline: "Lema",
    template: "Plantilla",
    light: "Claro",
    dark: "Oscuro",
    modern: "Moderno",
    warm: "Cálido",
  },

  // Time
  time: {
    today: "Hoy",
    yesterday: "Ayer",
    tomorrow: "Mañana",
    thisWeek: "Esta semana",
    lastWeek: "Semana pasada",
    nextWeek: "Próxima semana",
    months: [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
    ],
    daysShort: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
    daysLong: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
  },

  // Landing page
  landing: {
    hero: {
      title: "Gestiona tus clases de forma simple",
      subtitle: "La plataforma ideal para profesores independientes de pádel, piano, idiomas y más.",
      cta: "Comenzar Gratis",
      secondaryCta: "Ver Demo",
    },
    features: {
      title: "Todo lo que necesitas",
      subtitle: "Herramientas diseñadas para simplificar tu trabajo como profesor",
      scheduling: {
        title: "Agenda Inteligente",
        description: "Organiza tus clases y permite que tus estudiantes reserven horarios disponibles.",
      },
      payments: {
        title: "Gestión de Pagos",
        description: "Cobra con Mercado Pago y lleva el control de paquetes de clases automáticamente.",
      },
      students: {
        title: "Portal del Estudiante",
        description: "Tus estudiantes acceden a su información, reservan clases y pagan online.",
      },
      branding: {
        title: "Tu Marca",
        description: "Personaliza colores, logo y estilo para reflejar tu identidad profesional.",
      },
    },
    stats: {
      teachers: "Profesores",
      students: "Estudiantes",
      classes: "Clases Dictadas",
      satisfaction: "Satisfacción",
    },
    pricing: {
      title: "Precios Simples",
      subtitle: "Comienza gratis, escala cuando lo necesites",
      free: {
        name: "Gratis",
        price: "$0",
        period: "/mes",
        features: [
          "Hasta 10 estudiantes",
          "Agenda básica",
          "Pagos con Mercado Pago",
          "Portal del estudiante",
        ],
      },
      pro: {
        name: "Pro",
        price: "$2.500",
        period: "/mes",
        features: [
          "Estudiantes ilimitados",
          "Marca personalizada",
          "Reportes avanzados",
          "Soporte prioritario",
          "Notificaciones por email",
        ],
      },
    },
    testimonials: {
      title: "Lo que dicen nuestros usuarios",
    },
    cta: {
      title: "¿Listo para simplificar tu trabajo?",
      subtitle: "Únete a cientos de profesores que ya gestionan sus clases con nosotros.",
      button: "Crear Cuenta Gratis",
    },
    footer: {
      description: "La plataforma de gestión de clases para profesores independientes.",
      product: "Producto",
      company: "Empresa",
      legal: "Legal",
      features: "Funcionalidades",
      pricing: "Precios",
      about: "Nosotros",
      contact: "Contacto",
      terms: "Términos",
      privacy: "Privacidad",
      rights: "Todos los derechos reservados.",
    },
  },
};
