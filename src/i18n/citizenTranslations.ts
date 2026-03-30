export type Language = "en" | "es";

export const translations = {
  en: {
    // Header
    citizenConnect: "Citizen Connect",
    publicStatus: "Public Status",
    signOut: "Sign Out",
    english: "English",
    spanish: "Spanish (Español)",

    // Welcome
    pageTitle: "Welcome to Your Citizen Portal",
    pageSubtitle: "Report a non-emergency issue in your community. Fill out the form below and track your request status.",

    // Form
    formTitle: "Submit a Service Request",
    formSubtitle: "Report a non-emergency issue in your community.",
    requestType: "Request Type",
    selectRequestType: "Select a request type",
    location: "Location",
    locationPlaceholder: "Enter address or intersection",
    description: "Description",
    descriptionPlaceholder: "Describe the issue in detail",
    attachPhoto: "Attach a Photo (Optional)",
    attachHelper: "Accepted formats: PNG, JPG, PDF. Max size: 5MB.",
    submitRequest: "Submit Request",
    dragDrop: "Drag & drop a photo here, or",
    browseFiles: "browse files",

    // Validation
    requestTypeRequired: "Request type is required.",
    locationRequired: "Location is required.",
    descriptionRequired: "Description is required.",
    descriptionMinLength: "Description must be at least 20 characters.",
    fileTypeError: "Only PNG, JPG, and PDF files are accepted.",
    fileSizeError: "File is too large. Maximum size is 5MB.",
    uploadFailed: "File upload failed. Please try again.",
    submitFailed: "Something went wrong. Please try again.",

    // Success
    requestSubmitted: "Request Submitted!",
    requestLogged: "Your request has been logged. Your Request ID is:",
    submitAnother: "Submit Another Request",
    returnToPortal: "Return to Portal",

    // My Requests
    myRequests: "My Requests",
    noRequests: "You haven't submitted any requests yet.",
    loadError: "Unable to load your requests. Please refresh the page.",
    view: "View",
    survey: "Survey",
    requestDetails: "Request Details",
    requestId: "Request ID",
    status: "Status",
    dateSubmitted: "Date Submitted",
    attachment: "Attachment",
    viewAttachedFile: "View Attached File",
    noAttachment: "No attachment provided.",
    statusHistory: "Status History",

    // Request types
    pothole: "Pothole",
    streetlight: "Broken Streetlight",
    dumping: "Illegal Dumping",
    graffiti: "Graffiti",
    other: "Other",

    // Status page
    civicTracker: "Civic Tracker",
    public: "Public",
    returnToPortal: "Return to Portal",
    serviceRequestStatus: "Service Request Status",
    statusSubtitle: "All-time overview · Public read-only view · No login required",
    totalRequests: "Total Requests",
    openInProgress: "Open / In Progress",
    resolvedClosed: "Resolved / Closed",
    chartTitle: "Open vs Resolved by Category",
    chartDescription: "Counts across all requests — no personal information included",
    noRequestsRecorded: "No requests recorded yet.",
    openLabel: "Open / In Progress",
    resolvedLabel: "Resolved / Closed",
    privacyNotice: "This page displays aggregate counts only. No names, email addresses, physical addresses, phone numbers, or any other personal information are shown or returned in API responses (S2-06 · F16 — Zero-PII Public Dashboard).",
    lastUpdated: "Last updated:",
    loadStatusError: "Unable to load status data. Please try again later.",
  },
  es: {
    // Header
    citizenConnect: "Citizen Connect",
    publicStatus: "Estado Público",
    signOut: "Cerrar Sesión",
    english: "English",
    spanish: "Spanish (Español)",

    // Welcome
    pageTitle: "Bienvenido a su Portal Ciudadano",
    pageSubtitle: "Reporte un problema no urgente en su comunidad. Complete el formulario a continuación y haga seguimiento del estado de su solicitud.",

    // Form
    formTitle: "Enviar una Solicitud de Servicio",
    formSubtitle: "Reporte un problema no urgente en su comunidad.",
    requestType: "Tipo de Solicitud",
    selectRequestType: "Seleccione un tipo de solicitud",
    location: "Ubicación",
    locationPlaceholder: "Ingrese dirección o intersección",
    description: "Descripción",
    descriptionPlaceholder: "Describa el problema en detalle",
    attachPhoto: "Adjuntar una Foto (Opcional)",
    attachHelper: "Formatos aceptados: PNG, JPG, PDF. Tamaño máximo: 5MB.",
    submitRequest: "Enviar Solicitud",
    dragDrop: "Arrastre y suelte una foto aquí, o",
    browseFiles: "busque archivos",

    // Validation
    requestTypeRequired: "El tipo de solicitud es obligatorio.",
    locationRequired: "La ubicación es obligatoria.",
    descriptionRequired: "La descripción es obligatoria.",
    descriptionMinLength: "La descripción debe tener al menos 20 caracteres.",
    fileTypeError: "Solo se aceptan archivos PNG, JPG y PDF.",
    fileSizeError: "El archivo es demasiado grande. Tamaño máximo: 5MB.",
    uploadFailed: "Error al subir el archivo. Por favor intente de nuevo.",
    submitFailed: "Algo salió mal. Por favor intente de nuevo.",

    // Success
    requestSubmitted: "¡Solicitud Enviada!",
    requestLogged: "Su solicitud ha sido registrada. Su ID de solicitud es:",
    submitAnother: "Enviar Otra Solicitud",
    returnToPortal: "Volver al Portal",

    // My Requests
    myRequests: "Mis Solicitudes",
    noRequests: "Aún no ha enviado ninguna solicitud.",
    loadError: "No se pudieron cargar sus solicitudes. Por favor actualice la página.",
    view: "Ver",
    survey: "Encuesta",
    requestDetails: "Detalles de la Solicitud",
    requestId: "ID de Solicitud",
    status: "Estado",
    dateSubmitted: "Fecha de Envío",
    attachment: "Adjunto",
    viewAttachedFile: "Ver Archivo Adjunto",
    noAttachment: "No se proporcionó adjunto.",
    statusHistory: "Historial de Estado",

    // Request types
    pothole: "Bache",
    streetlight: "Farola Rota",
    dumping: "Vertido Ilegal",
    graffiti: "Grafiti",
    other: "Otro",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;
