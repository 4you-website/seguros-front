import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import AnimateHeight from 'react-animate-height';
import IconCaretDown from '../../Icon/IconCaretDown';
import type { SidebarItem } from './sidebarConfig';

interface Props {
    item: SidebarItem;
    activeMenu: string;
    onToggle: (label: string) => void;
}

const SidebarMenu = ({ item, activeMenu, onToggle }: Props) => {
    const [open, setOpen] = useState(false);
    const Icon = item.icon;

    if (item.children) {
        return (
            <li className="menu nav-item">
                <button
                    type="button"
                    className={`${activeMenu === item.label ? 'active' : ''} nav-link group w-full`}
                    onClick={() => {
                        onToggle(item.label);
                        setOpen(!open);
                    }}
                >
                    <div className="flex items-center">
                        {Icon && <Icon className="group-hover:!text-primary shrink-0" />}
                        <span className="ltr:pl-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">
                            {item.label}
                        </span>
                    </div>
                    <div className={`${!open ? 'rtl:rotate-90 -rotate-90' : ''}`}>
                        <IconCaretDown />
                    </div>
                </button>

                <AnimateHeight duration={300} height={open ? 'auto' : 0}>
                    <ul className="sub-menu text-gray-500">
                        {item.children.map((child) => (
                            <li key={child.label}>
                                <NavLink to={child.path || '#'}>{child.label}</NavLink>
                            </li>
                        ))}
                    </ul>
                </AnimateHeight>
            </li>
        );
    }

    return (
        <li className="nav-item">
            <NavLink to={item.path || '#'} target={item.target} className="group">
                <div className="flex items-center">
                    {Icon && <Icon className="group-hover:!text-primary shrink-0" />}
                    <span className="ltr:pl-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">
                        {item.label}
                    </span>
                </div>
            </NavLink>
        </li>
    );
};

export default SidebarMenu;
