export const t = {
  // Navigation
  nav: {
    dashboard: "Panel",
    students: "Estudiantes",
    schedule: "Horario",
    payments: "Pagos",
    settings: "Configuración",
    logout: "Cerrar Sesión",
  },

  // Buttons
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

  // Forms
  forms: {
    email: "Correo Electrónico",
    password: "Contraseña",
    name: "Nombre",
    phone: "Teléfono",
    className: "Nombre de la Clase",
    description: "Descripción",
    durationMins: "Duración (minutos)",
    maxStudents: "Máximo de Estudiantes",
    planName: "Nombre del Plan",
    numClasses: "Cantidad de Clases",
    price: "Precio",
    validityDays: "Días de Validez",
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
  },

  // Dashboard
  dashboard: {
    welcome: "Bienvenido",
    studentDashboard: "Panel del Estudiante",
    teacherDashboard: "Panel del Profesor",
    myClasses: "Mis Clases",
    myStudents: "Mis Estudiantes",
    mySchedule: "Mi Horario",
    myPayments: "Mis Pagos",
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
};
