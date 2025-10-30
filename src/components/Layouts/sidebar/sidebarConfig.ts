import IconMenuDashboard from '../../Icon/Menu/IconMenuDashboard';
import IconMenuChat from '../../Icon/Menu/IconMenuChat';
import IconMenuMailbox from '../../Icon/Menu/IconMenuMailbox';
import IconMenuTodo from '../../Icon/Menu/IconMenuTodo';
import IconMenuNotes from '../../Icon/Menu/IconMenuNotes';
import IconMenuScrumboard from '../../Icon/Menu/IconMenuScrumboard';
import IconMenuContacts from '../../Icon/Menu/IconMenuContacts';
import IconMenuInvoice from '../../Icon/Menu/IconMenuInvoice';
import IconMenuCalendar from '../../Icon/Menu/IconMenuCalendar';
import IconMenuComponents from '../../Icon/Menu/IconMenuComponents';
import IconMenuElements from '../../Icon/Menu/IconMenuElements';
import IconMenuCharts from '../../Icon/Menu/IconMenuCharts';
import IconMenuWidgets from '../../Icon/Menu/IconMenuWidgets';
import IconMenuFontIcons from '../../Icon/Menu/IconMenuFontIcons';
import IconMenuDragAndDrop from '../../Icon/Menu/IconMenuDragAndDrop';
import IconMenuTables from '../../Icon/Menu/IconMenuTables';
import IconMenuDatatables from '../../Icon/Menu/IconMenuDatatables';
import IconMenuForms from '../../Icon/Menu/IconMenuForms';
import IconMenuUsers from '../../Icon/Menu/IconMenuUsers';
import IconMenuPages from '../../Icon/Menu/IconMenuPages';
import IconMenuAuthentication from '../../Icon/Menu/IconMenuAuthentication';
import IconMenuDocumentation from '../../Icon/Menu/IconMenuDocumentation';
import IconMessage from '../../Icon/IconMailDot';


export interface SidebarItem {
    label: string;
    icon?: React.ElementType;
    path?: string;
    children?: SidebarItem[];
    target?: string;
}

export interface SidebarSection {
    title?: string;
    items: SidebarItem[];
}

export const sidebarConfig: SidebarSection[] = [
    {
        items: [
            { label: 'Expedientes', icon: IconMenuNotes, path: '/expedientes' },
            { label: 'Notificaciones', icon: IconMessage, path: '/notificaciones' },
            {
                label: 'Dashboard',
                icon: IconMenuDashboard,
                children: [
                    { label: 'Ventas', path: '/' },
                    { label: 'Analítica', path: '/analytics' },
                    { label: 'Finanzas', path: '/finance' },
                    { label: 'Cripto', path: '/crypto' },
                ],
            },
        ],
    },
    {
        title: 'Aplicaciones',
        items: [
            { label: 'Chat', icon: IconMenuChat, path: '/apps/chat' },
            { label: 'Correo', icon: IconMenuMailbox, path: '/apps/mailbox' },
            { label: 'Tareas', icon: IconMenuTodo, path: '/apps/todolist' },
            { label: 'Notas', icon: IconMenuNotes, path: '/apps/notes' },
            { label: 'Scrumboard', icon: IconMenuScrumboard, path: '/apps/scrumboard' },
            { label: 'Contactos', icon: IconMenuContacts, path: '/apps/contacts' },
            {
                label: 'Facturas',
                icon: IconMenuInvoice,
                children: [
                    { label: 'Lista', path: '/apps/invoice/list' },
                    { label: 'Vista previa', path: '/apps/invoice/preview' },
                    { label: 'Agregar', path: '/apps/invoice/add' },
                    { label: 'Editar', path: '/apps/invoice/edit' },
                ],
            },
            { label: 'Calendario', icon: IconMenuCalendar, path: '/apps/calendar' },
        ],
    },
    {
        title: 'Interfaz de usuario',
        items: [
            {
                label: 'Componentes',
                icon: IconMenuComponents,
                children: [
                    { label: 'Tabs', path: '/components/tabs' },
                    { label: 'Acordeones', path: '/components/accordions' },
                    { label: 'Modales', path: '/components/modals' },
                    { label: 'Cards', path: '/components/cards' },
                    { label: 'Carrusel', path: '/components/carousel' },
                    { label: 'Cuenta regresiva', path: '/components/countdown' },
                    { label: 'Contador', path: '/components/counter' },
                    { label: 'Sweet Alerts', path: '/components/sweetalert' },
                    { label: 'Timeline', path: '/components/timeline' },
                    { label: 'Notificaciones', path: '/components/notifications' },
                    { label: 'Media Object', path: '/components/media-object' },
                    { label: 'Listas', path: '/components/list-group' },
                    { label: 'Precios', path: '/components/pricing-table' },
                    { label: 'Lightbox', path: '/components/lightbox' },
                ],
            },
            {
                label: 'Elementos',
                icon: IconMenuElements,
                children: [
                    { label: 'Alertas', path: '/elements/alerts' },
                    { label: 'Avatar', path: '/elements/avatar' },
                    { label: 'Badges', path: '/elements/badges' },
                    { label: 'Breadcrumbs', path: '/elements/breadcrumbs' },
                    { label: 'Botones', path: '/elements/buttons' },
                    { label: 'Grupos de botones', path: '/elements/buttons-group' },
                    { label: 'Colores', path: '/elements/color-library' },
                    { label: 'Dropdown', path: '/elements/dropdown' },
                    { label: 'Infobox', path: '/elements/infobox' },
                    { label: 'Jumbotron', path: '/elements/jumbotron' },
                    { label: 'Loader', path: '/elements/loader' },
                    { label: 'Paginación', path: '/elements/pagination' },
                    { label: 'Popovers', path: '/elements/popovers' },
                    { label: 'Barra de progreso', path: '/elements/progress-bar' },
                    { label: 'Búsqueda', path: '/elements/search' },
                    { label: 'Tooltips', path: '/elements/tooltips' },
                    { label: 'Treeview', path: '/elements/treeview' },
                    { label: 'Tipografía', path: '/elements/typography' },
                ],
            },
            { label: 'Gráficos', icon: IconMenuCharts, path: '/charts' },
            { label: 'Widgets', icon: IconMenuWidgets, path: '/widgets' },
            { label: 'Iconos', icon: IconMenuFontIcons, path: '/font-icons' },
            { label: 'Arrastrar y Soltar', icon: IconMenuDragAndDrop, path: '/dragndrop' },
        ],
    },
    {
        title: 'Tablas y Formularios',
        items: [
            { label: 'Tablas', icon: IconMenuTables, path: '/tables' },
            {
                label: 'Datatables',
                icon: IconMenuDatatables,
                children: [
                    { label: 'Básico', path: '/datatables/basic' },
                    { label: 'Avanzado', path: '/datatables/advanced' },
                    { label: 'Skin', path: '/datatables/skin' },
                    { label: 'Ordenamiento', path: '/datatables/order-sorting' },
                    { label: 'Multi columna', path: '/datatables/multi-column' },
                    { label: 'Múltiples tablas', path: '/datatables/multiple-tables' },
                    { label: 'Paginación alternativa', path: '/datatables/alt-pagination' },
                    { label: 'Checkbox', path: '/datatables/checkbox' },
                    { label: 'Búsqueda por rango', path: '/datatables/range-search' },
                    { label: 'Exportar', path: '/datatables/export' },
                    { label: 'Selector de columnas', path: '/datatables/column-chooser' },
                ],
            },
            {
                label: 'Formularios',
                icon: IconMenuForms,
                children: [
                    { label: 'Básico', path: '/forms/basic' },
                    { label: 'Input Group', path: '/forms/input-group' },
                    { label: 'Layouts', path: '/forms/layouts' },
                    { label: 'Validación', path: '/forms/validation' },
                    { label: 'Máscara de input', path: '/forms/input-mask' },
                    { label: 'Select2', path: '/forms/select2' },
                    { label: 'Touchspin', path: '/forms/touchspin' },
                    { label: 'Checkbox y Radio', path: '/forms/checkbox-radio' },
                    { label: 'Switches', path: '/forms/switches' },
                    { label: 'Wizards', path: '/forms/wizards' },
                    { label: 'Subida de archivos', path: '/forms/file-upload' },
                    { label: 'Quill Editor', path: '/forms/quill-editor' },
                    { label: 'Markdown Editor', path: '/forms/markdown-editor' },
                    { label: 'Date Picker', path: '/forms/date-picker' },
                    { label: 'Clipboard', path: '/forms/clipboard' },
                ],
            },
        ],
    },
    {
        title: 'Usuarios y Páginas',
        items: [
            {
                label: 'Usuarios',
                icon: IconMenuUsers,
                children: [
                    { label: 'Perfil', path: '/users/profile' },
                    { label: 'Configuración de cuenta', path: '/users/user-account-settings' },
                ],
            },
            {
                label: 'Páginas',
                icon: IconMenuPages,
                children: [
                    { label: 'Base de conocimiento', path: '/pages/knowledge-base' },
                    { label: 'Contacto (Boxed)', path: '/pages/contact-us-boxed', target: '_blank' },
                    { label: 'Contacto (Cover)', path: '/pages/contact-us-cover', target: '_blank' },
                    { label: 'FAQ', path: '/pages/faq' },
                    { label: 'Coming Soon (Boxed)', path: '/pages/coming-soon-boxed', target: '_blank' },
                    { label: 'Coming Soon (Cover)', path: '/pages/coming-soon-cover', target: '_blank' },
                    { label: 'Error 404', path: '/pages/error404', target: '_blank' },
                    { label: 'Error 500', path: '/pages/error500', target: '_blank' },
                    { label: 'Error 503', path: '/pages/error503', target: '_blank' },
                    { label: 'Mantenimiento', path: '/pages/maintenence', target: '_blank' },
                ],
            },
            {
                label: 'Autenticación',
                icon: IconMenuAuthentication,
                children: [
                    { label: 'Login Boxed', path: '/auth/boxed-signin', target: '_blank' },
                    { label: 'Registro Boxed', path: '/auth/boxed-signup', target: '_blank' },
                    { label: 'Lockscreen Boxed', path: '/auth/boxed-lockscreen', target: '_blank' },
                    { label: 'Reset Password Boxed', path: '/auth/boxed-password-reset', target: '_blank' },
                    { label: 'Login Cover', path: '/auth/cover-login', target: '_blank' },
                    { label: 'Registro Cover', path: '/auth/cover-register', target: '_blank' },
                    { label: 'Lockscreen Cover', path: '/auth/cover-lockscreen', target: '_blank' },
                    { label: 'Reset Password Cover', path: '/auth/cover-password-reset', target: '_blank' },
                ],
            },
        ],
    },
    {
        title: 'Soporte',
        items: [
            {
                label: 'Documentación',
                icon: IconMenuDocumentation,
                path: 'https://vristo.sbthemes.com',
                target: '_blank',
            },
        ],
    },
];
