import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import { toggleAnimation, toggleLayout, toggleMenu, toggleNavbar, toggleRTL, toggleTheme, toggleSemidark } from '../../store/themeConfigSlice';
import IconSettings from '../Icon/IconSettings';
import IconX from '../Icon/IconX';
import IconSun from '../Icon/IconSun';
import IconMoon from '../Icon/IconMoon';
import IconLaptop from '../Icon/IconLaptop';

const Setting = () => {
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const dispatch = useDispatch();

    const [showCustomizer, setShowCustomizer] = useState(false);

    return (
        <div>
            <div
                className={`${(showCustomizer && '!block') || ''} fixed inset-0 bg-[black]/60 z-[51] px-4 hidden transition-[display]`}
                onClick={() => setShowCustomizer(false)}
            ></div>

            <nav
                className={`${
                    (showCustomizer && 'ltr:!right-0 rtl:!left-0') || ''
                } bg-white fixed ltr:-right-[400px] rtl:-left-[400px] top-0 bottom-0 w-full max-w-[400px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-[right] duration-300 z-[51] dark:bg-black p-4`}
            >
                <button
                    type="button"
                    className="bg-primary ltr:rounded-tl-full rtl:rounded-tr-full ltr:rounded-bl-full rtl:rounded-br-full absolute ltr:-left-12 rtl:-right-12 top-0 bottom-0 my-auto w-12 h-10 flex justify-center items-center text-white cursor-pointer"
                    onClick={() => setShowCustomizer(!showCustomizer)}
                    aria-label="Abrir configuración"
                >
                    <IconSettings className="animate-[spin_3s_linear_infinite] w-5 h-5" />
                </button>

                <div className="overflow-y-auto overflow-x-hidden perfect-scrollbar h-full">
                    <div className="text-center relative pb-5">
                        <button
                            type="button"
                            className="absolute top-0 ltr:right-0 rtl:left-0 opacity-30 hover:opacity-100 dark:text-white"
                            onClick={() => setShowCustomizer(false)}
                            aria-label="Cerrar configuración"
                        >
                            <IconX className="w-5 h-5" />
                        </button>

                        <h4 className="mb-1 dark:text-white">Personalización</h4>
                        <p className="text-white-dark">
                            Ajustá las preferencias de visualización. Se guardarán para mantener tu configuración.
                        </p>
                    </div>

                    {/* Color Scheme */}
                    <div className="border border-dashed border-white-light dark:border-[#1b2e4b] rounded-md mb-3 p-3">
                        <h5 className="mb-1 text-base dark:text-white leading-none">Esquema de colores</h5>
                        <p className="text-white-dark text-xs">Elegí la apariencia general: claro, oscuro o según el sistema.</p>

                        <div className="grid grid-cols-3 gap-2 mt-3">
                            <button
                                type="button"
                                className={`${themeConfig.theme === 'light' ? 'btn-primary' : 'btn-outline-primary'} btn`}
                                onClick={() => dispatch(toggleTheme('light'))}
                            >
                                <IconSun className="w-5 h-5 shrink-0 ltr:mr-2 rtl:ml-2" />
                                Claro
                            </button>

                            <button
                                type="button"
                                className={`${themeConfig.theme === 'dark' ? 'btn-primary' : 'btn-outline-primary'} btn`}
                                onClick={() => dispatch(toggleTheme('dark'))}
                            >
                                <IconMoon className="w-5 h-5 shrink-0 ltr:mr-2 rtl:ml-2" />
                                Oscuro
                            </button>

                            <button
                                type="button"
                                className={`${themeConfig.theme === 'system' ? 'btn-primary' : 'btn-outline-primary'} btn`}
                                onClick={() => dispatch(toggleTheme('system'))}
                            >
                                <IconLaptop className="w-5 h-5 shrink-0 ltr:mr-2 rtl:ml-2" />
                                Sistema
                            </button>
                        </div>
                    </div>

                    {/* Navigation Position */}
                    <div className="border border-dashed border-white-light dark:border-[#1b2e4b] rounded-md mb-3 p-3">
                        <h5 className="mb-1 text-base dark:text-white leading-none">Posición de navegación</h5>
                        <p className="text-white-dark text-xs">Elegí el tipo de menú principal de la aplicación.</p>

                        <div className="grid grid-cols-3 gap-2 mt-3">

                            <button
                                type="button"
                                className={`${themeConfig.menu === 'vertical' ? 'btn-primary' : 'btn-outline-primary'} btn`}
                                onClick={() => dispatch(toggleMenu('vertical'))}
                            >
                                Vertical
                            </button>

                            <button
                                type="button"
                                className={`${themeConfig.menu === 'collapsible-vertical' ? 'btn-primary' : 'btn-outline-primary'} btn`}
                                onClick={() => dispatch(toggleMenu('collapsible-vertical'))}
                            >
                                Colapsable
                            </button>
                        </div>

                        <div className="mt-5 text-primary">
                            <label className="inline-flex mb-0">
                                <input
                                    type="checkbox"
                                    className="form-checkbox"
                                    checked={themeConfig.semidark === true || themeConfig.semidark === 'true'}
                                    onChange={(e) => dispatch(toggleSemidark(e.target.checked))}
                                />
                                <span>Semioscuro (Sidebar y Header)</span>
                            </label>
                        </div>
                    </div>

                    {/* Layout Style */}
                    <div className="border border-dashed border-white-light dark:border-[#1b2e4b] rounded-md mb-3 p-3">
                        <h5 className="mb-1 text-base dark:text-white leading-none">Estilo de diseño</h5>
                        <p className="text-white-dark text-xs">Definí cómo se presenta el contenido en pantalla.</p>

                        <div className="flex gap-2 mt-3">
                            <button
                                type="button"
                                className={`${themeConfig.layout === 'boxed-layout' ? 'btn-primary' : 'btn-outline-primary'} btn flex-auto`}
                                onClick={() => dispatch(toggleLayout('boxed-layout'))}
                            >
                                En caja
                            </button>

                            <button
                                type="button"
                                className={`${themeConfig.layout === 'full' ? 'btn-primary' : 'btn-outline-primary'} btn flex-auto`}
                                onClick={() => dispatch(toggleLayout('full'))}
                            >
                                Completo
                            </button>
                        </div>
                    </div>

                    {/* Direction */}
                    <div className="border border-dashed border-white-light dark:border-[#1b2e4b] rounded-md mb-3 p-3">
                        <h5 className="mb-1 text-base dark:text-white leading-none">Dirección</h5>
                        <p className="text-white-dark text-xs">Elegí el sentido del contenido (izquierda a derecha o viceversa).</p>

                        <div className="flex gap-2 mt-3">
                            <button
                                type="button"
                                className={`${themeConfig.rtlClass === 'ltr' ? 'btn-primary' : 'btn-outline-primary'} btn flex-auto`}
                                onClick={() => dispatch(toggleRTL('ltr'))}
                            >
                                LTR
                            </button>

                            <button
                                type="button"
                                className={`${themeConfig.rtlClass === 'rtl' ? 'btn-primary' : 'btn-outline-primary'} btn flex-auto`}
                                onClick={() => dispatch(toggleRTL('rtl'))}
                            >
                                RTL
                            </button>
                        </div>
                    </div>

                    {/* Navbar Type */}
                    <div className="border border-dashed border-white-light dark:border-[#1b2e4b] rounded-md mb-3 p-3">
                        <h5 className="mb-1 text-base dark:text-white leading-none">Tipo de barra superior</h5>
                        <p className="text-white-dark text-xs">Elegí si la barra queda fija o flotante.</p>

                        <div className="mt-3 flex items-center gap-3 text-primary">
                            <label className="inline-flex mb-0">
                                <input
                                    type="radio"
                                    checked={themeConfig.navbar === 'navbar-sticky'}
                                    value="navbar-sticky"
                                    className="form-radio"
                                    onChange={() => dispatch(toggleNavbar('navbar-sticky'))}
                                />
                                <span>Fija (Sticky)</span>
                            </label>

                            <label className="inline-flex mb-0">
                                <input
                                    type="radio"
                                    checked={themeConfig.navbar === 'navbar-floating'}
                                    value="navbar-floating"
                                    className="form-radio"
                                    onChange={() => dispatch(toggleNavbar('navbar-floating'))}
                                />
                                <span>Flotante</span>
                            </label>

                            <label className="inline-flex mb-0">
                                <input
                                    type="radio"
                                    checked={themeConfig.navbar === 'navbar-static'}
                                    value="navbar-static"
                                    className="form-radio"
                                    onChange={() => dispatch(toggleNavbar('navbar-static'))}
                                />
                                <span>Estática</span>
                            </label>
                        </div>
                    </div>

                    {/* Router Transition */}
                    <div className="border border-dashed border-white-light dark:border-[#1b2e4b] rounded-md mb-3 p-3">
                        <h5 className="mb-1 text-base dark:text-white leading-none">Transición de pantalla</h5>
                        <p className="text-white-dark text-xs">Animación al cambiar de sección.</p>

                        <div className="mt-3">
                            <select
                                className="form-select border-primary text-primary"
                                value={themeConfig.animation}
                                onChange={(e) => dispatch(toggleAnimation(e.target.value))}
                            >
                                <option value=" ">Ninguna</option>
                                <option value="animate__fadeIn">Desvanecer</option>
                                <option value="animate__fadeInDown">Desvanecer hacia abajo</option>
                                <option value="animate__fadeInUp">Desvanecer hacia arriba</option>
                                <option value="animate__fadeInLeft">Desvanecer desde la izquierda</option>
                                <option value="animate__fadeInRight">Desvanecer desde la derecha</option>
                                <option value="animate__slideInDown">Deslizar hacia abajo</option>
                                <option value="animate__slideInLeft">Deslizar desde la izquierda</option>
                                <option value="animate__slideInRight">Deslizar desde la derecha</option>
                                <option value="animate__zoomIn">Zoom de entrada</option>
                            </select>
                        </div>
                    </div>
                </div>
            </nav>
        </div>
    );
};

export default Setting;
