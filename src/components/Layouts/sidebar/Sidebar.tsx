import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { toggleSidebar } from '../../../store/themeConfigSlice';
import IconCaretsDown from '../../Icon/IconCaretsDown'; // ✅ ruta corregida
import { sidebarConfig } from './sidebarConfig';
import SidebarMenu from './SidebarMenu';
import { IRootState } from '../../../store';

const Sidebar = () => {
    const [activeMenu, setActiveMenu] = useState('');
    const dispatch = useDispatch();
    const semidark = useSelector((state: IRootState) => state.themeConfig.semidark);

    return (
        <div className={semidark ? 'dark' : ''}>
            <nav className="sidebar fixed h-full w-[260px] shadow-lg z-50 transition-all duration-300">
                <div className="bg-white dark:bg-black h-full">
                    {/* Header */}
                    <div className="flex justify-between items-center px-4 py-3">
                        <NavLink to="/" className="main-logo flex items-center shrink-0">
                            <img className="w-8 ml-1" src="/assets/images/logo.svg" alt="logo" />
                            <span className="text-2xl ml-2 font-semibold dark:text-white">Seguros</span>
                        </NavLink>

                        <button
                            onClick={() => dispatch(toggleSidebar())}
                            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-dark-light"
                        >
                            <IconCaretsDown className="rotate-90" />
                        </button>
                    </div>

                    {/* Menu */}
                    <PerfectScrollbar className="h-[calc(100vh-80px)] px-4">
                        <ul className="space-y-2">
                            {sidebarConfig.map((section, index) => (
                                <div key={index}>
                                    {section.title && (
                                        <h2 className="py-3 px-2 text-xs font-bold uppercase text-gray-500 dark:text-gray-400">
                                            {section.title}
                                        </h2>
                                    )}
                                    {section.items.map((item) => (
                                        <SidebarMenu key={item.label} item={item} activeMenu={activeMenu} onToggle={setActiveMenu} />
                                    ))}
                                </div>
                            ))}
                        </ul>
                    </PerfectScrollbar>
                </div>
            </nav>
        </div>
    );
};

export default Sidebar;
