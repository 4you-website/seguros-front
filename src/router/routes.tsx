import { Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

import Escritorio from '../pages/Escritorio';
import Notificaciones from '../pages/Notificaciones';
import Expedientes from '../pages/Expedientes';
import Tramites from '../pages/Tramites';
import Analytics from '../pages/Analytics';
import Finance from '../pages/Finance';
import Crypto from '../pages/Crypto';
import Todolist from '../pages/Apps/Todolist';
import Mailbox from '../pages/Apps/Mailbox';
import Notes from '../pages/Apps/Notes';
import Contacts from '../pages/Apps/Contacts';
import Chat from '../pages/Apps/Chat';
import Scrumboard from '../pages/Apps/Scrumboard';
import Calendar from '../pages/Apps/Calendar';
import Preview from '../pages/Apps/Invoice/Preview';
import Add from '../pages/Apps/Invoice/Add';
import Edit from '../pages/Apps/Invoice/Edit';
import Tabs from '../pages/Components/Tabs';
import Accordians from '../pages/Components/Accordians';
import Modals from '../pages/Components/Modals';
import Cards from '../pages/Components/Cards';
import Carousel from '../pages/Components/Carousel';
import Countdown from '../pages/Components/Countdown';
import Counter from '../pages/Components/Counter';
import SweetAlert from '../pages/Components/SweetAlert';
import Timeline from '../pages/Components/Timeline';
import Notification from '../pages/Components/Notification';
import MediaObject from '../pages/Components/MediaObject';
import ListGroup from '../pages/Components/ListGroup';
import PricingTable from '../pages/Components/PricingTable';
import LightBox from '../pages/Components/LightBox';
import Alerts from '../pages/Elements/Alerts';
import Avatar from '../pages/Elements/Avatar';
import Badges from '../pages/Elements/Badges';
import Breadcrumbs from '../pages/Elements/Breadcrumbs';
import Buttons from '../pages/Elements/Buttons';
import Buttongroups from '../pages/Elements/Buttongroups';
import Colorlibrary from '../pages/Elements/Colorlibrary';
import DropdownPage from '../pages/Elements/DropdownPage';
import Infobox from '../pages/Elements/Infobox';
import Jumbotron from '../pages/Elements/Jumbotron';
import Loader from '../pages/Elements/Loader';
import Pagination from '../pages/Elements/Pagination';
import Popovers from '../pages/Elements/Popovers';
import Progressbar from '../pages/Elements/Progressbar';
import Search from '../pages/Elements/Search';
import Tooltip from '../pages/Elements/Tooltip';
import Treeview from '../pages/Elements/Treeview';
import Typography from '../pages/Elements/Typography';
import Charts from '../pages/Charts';
import Widgets from '../pages/Widgets';
import FontIcons from '../pages/FontIcons';
import DragAndDrop from '../pages/DragAndDrop';
import Tables from '../pages/Tables';
import Basic from '../pages/DataTables/Basic';
import Advanced from '../pages/DataTables/Advanced';
import Skin from '../pages/DataTables/Skin';
import OrderSorting from '../pages/DataTables/OrderSorting';
import MultiColumn from '../pages/DataTables/MultiColumn';
import MultipleTables from '../pages/DataTables/MultipleTables';
import AltPagination from '../pages/DataTables/AltPagination';
import Checkbox from '../pages/DataTables/Checkbox';
import RangeSearch from '../pages/DataTables/RangeSearch';
import Export from '../pages/DataTables/Export';
import ColumnChooser from '../pages/DataTables/ColumnChooser';
import Profile from '../pages/Users/Profile';
import AccountSetting from '../pages/Users/AccountSetting';
import KnowledgeBase from '../pages/Pages/KnowledgeBase';
import ContactUsBoxed from '../pages/Pages/ContactUsBoxed';
import ContactUsCover from '../pages/Pages/ContactUsCover';
import Faq from '../pages/Pages/Faq';
import ComingSoonBoxed from '../pages/Pages/ComingSoonBoxed';
import ComingSoonCover from '../pages/Pages/ComingSoonCover';
import ERROR404 from '../pages/Pages/Error404';
import ERROR500 from '../pages/Pages/Error500';
import ERROR503 from '../pages/Pages/Error503';
import Maintenence from '../pages/Pages/Maintenence';
import LoginBoxed from '../pages/Authentication/LoginBoxed';
import RegisterBoxed from '../pages/Authentication/RegisterBoxed';
import RecoverIdBoxed from '../pages/Authentication/RecoverIdBox';
import FormBasic from '../pages/Forms/Basic';
import FormInputGroup from '../pages/Forms/InputGroup';
import FormLayouts from '../pages/Forms/Layouts';
import Validation from '../pages/Forms/Validation';
import InputMask from '../pages/Forms/InputMask';
import Select2 from '../pages/Forms/Select2';
import Touchspin from '../pages/Forms/TouchSpin';
import CheckBoxRadio from '../pages/Forms/CheckboxRadio';
import Switches from '../pages/Forms/Switches';
import Wizards from '../pages/Forms/Wizards';
import FileUploadPreview from '../pages/Forms/FileUploadPreview';
import QuillEditor from '../pages/Forms/QuillEditor';
import MarkDownEditor from '../pages/Forms/MarkDownEditor';
import DateRangePicker from '../pages/Forms/DateRangePicker';
import Clipboard from '../pages/Forms/Clipboard';
import About from '../pages/About';
import Error from '../components/Error';

// 🧩 Tus rutas originales
const baseRoutes = [
    // dashboard
    { path: '/', element: <Navigate to="/auth/login" replace /> },
    { path: '/escritorio', element: <Escritorio /> },
    { path: '/notificaciones', element: <Notificaciones /> },
    { path: '/expedientes', element: <Expedientes /> },
    { path: '/expedientes/:id/tramites', element: <Tramites /> },
    { path: '/analytics', element: <Analytics /> },
    { path: '/finance', element: <Finance /> },
    { path: '/crypto', element: <Crypto /> },
    { path: '/apps/todolist', element: <Todolist /> },
    { path: '/apps/notes', element: <Notes /> },
    { path: '/apps/contacts', element: <Contacts /> },
    { path: '/apps/mailbox', element: <Mailbox /> },
    { path: '/apps/chat', element: <Chat /> },
    { path: '/apps/scrumboard', element: <Scrumboard /> },
    { path: '/apps/calendar', element: <Calendar /> },
    { path: '/apps/invoice/preview', element: <Preview /> },
    { path: '/apps/invoice/add', element: <Add /> },
    { path: '/apps/invoice/edit', element: <Edit /> },
    { path: '/components/tabs', element: <Tabs /> },
    { path: '/components/accordions', element: <Accordians /> },
    { path: '/components/modals', element: <Modals /> },
    { path: '/components/cards', element: <Cards /> },
    { path: '/components/carousel', element: <Carousel /> },
    { path: '/components/countdown', element: <Countdown /> },
    { path: '/components/counter', element: <Counter /> },
    { path: '/components/sweetalert', element: <SweetAlert /> },
    { path: '/components/timeline', element: <Timeline /> },
    { path: '/components/notifications', element: <Notification /> },
    { path: '/components/media-object', element: <MediaObject /> },
    { path: '/components/list-group', element: <ListGroup /> },
    { path: '/components/pricing-table', element: <PricingTable /> },
    { path: '/components/lightbox', element: <LightBox /> },
    { path: '/elements/alerts', element: <Alerts /> },
    { path: '/elements/avatar', element: <Avatar /> },
    { path: '/elements/badges', element: <Badges /> },
    { path: '/elements/breadcrumbs', element: <Breadcrumbs /> },
    { path: '/elements/buttons', element: <Buttons /> },
    { path: '/elements/buttons-group', element: <Buttongroups /> },
    { path: '/elements/color-library', element: <Colorlibrary /> },
    { path: '/elements/dropdown', element: <DropdownPage /> },
    { path: '/elements/infobox', element: <Infobox /> },
    { path: '/elements/jumbotron', element: <Jumbotron /> },
    { path: '/elements/loader', element: <Loader /> },
    { path: '/elements/pagination', element: <Pagination /> },
    { path: '/elements/popovers', element: <Popovers /> },
    { path: '/elements/progress-bar', element: <Progressbar /> },
    { path: '/elements/search', element: <Search /> },
    { path: '/elements/tooltips', element: <Tooltip /> },
    { path: '/elements/treeview', element: <Treeview /> },
    { path: '/elements/typography', element: <Typography /> },
    { path: '/charts', element: <Charts /> },
    { path: '/widgets', element: <Widgets /> },
    { path: '/font-icons', element: <FontIcons /> },
    { path: '/dragndrop', element: <DragAndDrop /> },
    { path: '/tables', element: <Tables /> },
    { path: '/datatables/basic', element: <Basic /> },
    { path: '/datatables/advanced', element: <Advanced /> },
    { path: '/datatables/skin', element: <Skin /> },
    { path: '/datatables/order-sorting', element: <OrderSorting /> },
    { path: '/datatables/multi-column', element: <MultiColumn /> },
    { path: '/datatables/multiple-tables', element: <MultipleTables /> },
    { path: '/datatables/alt-pagination', element: <AltPagination /> },
    { path: '/datatables/checkbox', element: <Checkbox /> },
    { path: '/datatables/range-search', element: <RangeSearch /> },
    { path: '/datatables/export', element: <Export /> },
    { path: '/datatables/column-chooser', element: <ColumnChooser /> },
    { path: '/users/profile', element: <Profile /> },
    { path: '/users/user-account-settings', element: <AccountSetting /> },
    { path: '/pages/knowledge-base', element: <KnowledgeBase /> },
    { path: '/pages/contact-us-boxed', element: <ContactUsBoxed />, layout: 'blank' },
    { path: '/pages/contact-us-cover', element: <ContactUsCover />, layout: 'blank' },
    { path: '/pages/faq', element: <Faq /> },
    { path: '/pages/coming-soon-boxed', element: <ComingSoonBoxed />, layout: 'blank' },
    { path: '/pages/coming-soon-cover', element: <ComingSoonCover />, layout: 'blank' },
    { path: '/pages/error404', element: <ERROR404 />, layout: 'blank' },
    { path: '/pages/error500', element: <ERROR500 />, layout: 'blank' },
    { path: '/pages/error503', element: <ERROR503 />, layout: 'blank' },
    { path: '/pages/maintenence', element: <Maintenence />, layout: 'blank' },
    { path: '/auth/login', element: <LoginBoxed />, layout: 'blank' },
    { path: '/auth/boxed-signup', element: <RegisterBoxed />, layout: 'blank' },
    { path: '/auth/boxed-password-reset', element: <RecoverIdBoxed />, layout: 'blank' },
    { path: '/forms/basic', element: <FormBasic /> },
    { path: '/forms/input-group', element: <FormInputGroup /> },
    { path: '/forms/layouts', element: <FormLayouts /> },
    { path: '/forms/validation', element: <Validation /> },
    { path: '/forms/input-mask', element: <InputMask /> },
    { path: '/forms/select2', element: <Select2 /> },
    { path: '/forms/touchspin', element: <Touchspin /> },
    { path: '/forms/checkbox-radio', element: <CheckBoxRadio /> },
    { path: '/forms/switches', element: <Switches /> },
    { path: '/forms/wizards', element: <Wizards /> },
    { path: '/forms/file-upload', element: <FileUploadPreview /> },
    { path: '/forms/quill-editor', element: <QuillEditor /> },
    { path: '/forms/markdown-editor', element: <MarkDownEditor /> },
    { path: '/forms/date-picker', element: <DateRangePicker /> },
    { path: '/forms/clipboard', element: <Clipboard /> },
    { path: '/about', element: <About />, layout: 'blank' },
    { path: '*', element: <Error />, layout: 'blank' },
];

// 🧠 Aplicamos ProtectedRoute automáticamente
const routes = baseRoutes.map((r) => {
    if (r.layout === 'blank' || r.path === '/') return r; // públicas
    return { ...r, element: <ProtectedRoute element={r.element} /> };
});

export { routes };
