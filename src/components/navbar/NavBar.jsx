import { useState, useRef, useEffect } from "react";
import { FaBars, FaListAlt, FaEdit, FaUsers} from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { School, Computer, Profile, SignIn, Q, Scroll, Book } from "../icons/index.jsx";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import '../../styles/nav.css';

const authenticatedSidebarLinks = [
    { label: "Dashboard", path: "/dashboard", icon: Profile },
    { label: "User-Made Quizzes", path: "/allcustomquizzes", icon: FaUsers, dividerBefore: true },
    { label: "My Quizzes", path: "/myquizzes", icon: FaListAlt },
    { label: "Make Quiz", path: "/customquiz", icon: FaEdit, dividerBefore: true },
    { label: "Make Flashcards", path: "/flashcards", icon: Computer },
    { label: "Browse Flashcards", path: "/browse-flashcards", icon: Book, dividerBefore: true },
    { label: "My Flashcards", path: "/myflashcards", icon: Scroll }
];

const guestSidebarLinks = [
    { label: "Home", path: "/", icon: Profile },
    { label: "Take a Poll", path: "/poll", icon: Q },
    { label: "Sign In", path: "/signin", icon: SignIn }
];

const SidebarNavItem = ({ item, expanded, onClick }) => {
    const Icon = item.icon;

    return (
        <NavLink
            to={item.path}
            onClick={onClick}
            title={!expanded ? item.label : undefined}
            className={({ isActive }) =>
                `group flex h-12 items-center overflow-hidden rounded-xl font-bold transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${
                    expanded ? "w-full justify-start gap-3 px-3" : "mx-auto w-10 justify-center px-0"
                } ${
                    isActive
                        ? "bg-[var(--accent)]/15 text-[var(--accent)] shadow-[0_8px_22px_rgba(168,85,247,0.10)]"
                        : "text-[var(--text-primary)] hover:bg-[var(--accent)]/10 hover:text-[var(--accent)]"
                }`
            }
        >
            <span className="flex h-4 w-4 shrink-0 items-center justify-center text-current [&_svg]:h-4 [&_svg]:w-4 [&_svg]:text-current [&_svg]:fill-current [&_svg_*]:fill-current [&_svg_*]:stroke-current">
                <Icon className="h-4 w-4" />
            </span>
            <span
                className={`whitespace-nowrap text-base transition-[max-width,opacity,transform] duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${
                    expanded
                        ? "max-w-[150px] translate-x-0 opacity-100 delay-75"
                        : "max-w-0 -translate-x-3 opacity-0"
                }`}
            >
                {item.label}
            </span>
        </NavLink>
    );
};

export default function NavBar() {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const isAuthenticated = Boolean(currentUser?.uid || currentUser?.email);
    const [profileOpen, setProfileOpen] = useState(false);
    const [sidebarExpanded, setSidebarExpanded] = useState(false);

    useEffect(() => {
        const root = document.getElementById("root");

        root?.classList.add("quizmaster-has-sidebar");
        root?.classList.toggle("quizmaster-sidebar-expanded", sidebarExpanded);

        return () => {
            root?.classList.remove("quizmaster-has-sidebar");
            root?.classList.remove("quizmaster-sidebar-expanded");
        };
    }, [sidebarExpanded]);

    const profileRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (profileOpen && profileRef.current && !profileRef.current.contains(event.target)) {
                setProfileOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [profileOpen]);

    useEffect(() => {
        if (!isAuthenticated) {
            setProfileOpen(false);
        }
    }, [isAuthenticated]);

    const handleClick = () => {
        window.scrollTo(0, 0);
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/signin');
            setProfileOpen(false);
        } catch (error) {
            console.error("Failed to logout:", error);
        }
    };

    return (
        <>
            <nav className="quizmaster-topbar flex h-[72px] items-center px-6 relative">
                <h1 className="brand-title pointer-events-none absolute left-1/2 transform -translate-x-1/2 sm:text-2xl font-extrabold">
                    <span className="text-3xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 drop-shadow-sm">QuizMaster</span>
                </h1>

                <NavLink
                    to="/poll"
                    onClick={handleClick}
                    className="hidden md:inline-flex ml-auto items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 px-5 py-2 text-white font-semibold shadow-[0_8px_22px_rgba(124,58,237,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(124,58,237,0.36)]"
                >
                    <Q className="w-4 h-4" />
                    Take a Poll
                </NavLink>

                {isAuthenticated && (
                    <div className="relative inline-flex ml-auto md:ml-4 z-50" ref={profileRef}>
                        <button
                            onClick={() => setProfileOpen(!profileOpen)}
                            aria-haspopup="true"
                            aria-expanded={profileOpen}
                            aria-label="Open profile menu"
                            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm transition-all duration-150 hover:bg-[var(--accent)]/10 hover:text-[var(--accent)] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)] [&_svg]:text-current [&_svg]:fill-current [&_svg_*]:fill-current [&_svg_*]:stroke-current"
                        >
                            <Profile className="w-6 h-6 text-current" aria-hidden="true" />
                        </button>

                        {profileOpen && (
                            <div className="absolute right-0 mt-2 w-44 rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] shadow-lg py-1 z-50">
                                <NavLink to="/Profile" onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--accent)]/10 hover:text-[var(--accent)]">
                                    Profile
                                </NavLink>
                                <NavLink to="/settings" onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--accent)]/10 hover:text-[var(--accent)]">
                                    Setting
                                </NavLink>
                                <button onClick={() => { setProfileOpen(false); handleLogout(); }} className="w-full text-left block px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--accent)]/10 hover:text-[var(--accent)]">
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </nav>

            <aside
                className={`side-drawer fixed left-0 top-0 z-40 hidden h-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-[10px_0_30px_rgba(0,0,0,0.10)] transition-[width] duration-300 ease-[cubic-bezier(0.2,0,0,1)] md:block ${
                    sidebarExpanded ? "w-[230px]" : "w-[64px]"
                }`}
            >
                <div className={`flex h-20 items-center overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${sidebarExpanded ? "justify-start gap-3 px-4" : "justify-center gap-0 px-0"}`}>
                    <button
                        onClick={() => setSidebarExpanded((prev) => !prev)}
                        className="hamburger-menu flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg text-[var(--text-primary)] transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] hover:bg-[var(--accent)]/10 hover:text-[var(--accent)] [&_svg]:text-current [&_svg]:fill-current [&_svg_*]:fill-current [&_svg_*]:stroke-current"
                        aria-label="Toggle Sidebar"
                        aria-expanded={sidebarExpanded}
                    >
                        <FaBars />
                    </button>

                    <NavLink
                        to="/dashboard"
                        onClick={handleClick}
                        className={`flex min-w-0 items-center overflow-hidden text-2xl font-black text-purple-500 transition-[max-width,opacity,transform] duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${
                            sidebarExpanded
                                ? "max-w-[150px] translate-x-0 opacity-100 delay-75"
                                : "pointer-events-none max-w-0 -translate-x-3 opacity-0"
                        }`}
                    >
                        <span className="truncate bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                            QuizMaster
                        </span>
                    </NavLink>
                </div>

                <div className="flex h-[calc(100vh-80px)] flex-col justify-between">
                    <div className={`py-5 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${sidebarExpanded ? "px-3" : "px-2"}`}>
                        <nav className="space-y-2">
                            {(isAuthenticated ? authenticatedSidebarLinks : guestSidebarLinks).map((item) => (
                                <div key={item.label}>
                                    {item.dividerBefore && (
                                        <div
                                            className={`my-3 border-t border-[var(--border)] opacity-80 shadow-sm transition-all duration-300 ${
                                                sidebarExpanded ? "mx-2" : "mx-auto w-8"
                                            }`}
                                        />
                                    )}
                                    <SidebarNavItem
                                        item={item}
                                        expanded={sidebarExpanded}
                                        onClick={handleClick}
                                    />
                                </div>
                            ))}
                        </nav>
                    </div>

                    {isAuthenticated && (
                        <div className="pb-6 pt-4 bg-[var(--btn-primary-bg)] shadow-[0_-10px_24px_rgba(0,0,0,0.08)] transition-all duration-300">
                            <div className={`transition-all duration-300 ${sidebarExpanded ? "px-3" : "px-2"}`}>
                                <button
                                    onClick={handleLogout}
                                    title={!sidebarExpanded ? "Logout" : undefined}
                                    className={`group flex h-12 items-start overflow-hidden rounded-lg font-medium text-[var(--btn-primary-text)] hover:bg-white/10 transition-all duration-200 w-full ${
                                        sidebarExpanded
                                            ? "justify-start gap-3 px-3"
                                            : "justify-center px-0"
                                    }`}
                                >
                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center text-current">
                                        <FiLogOut className="h-5 w-5" />
                                    </span>

                                    <span
                                        className={`whitespace-nowrap text-base transition-[max-width,opacity,transform] duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${
                                            sidebarExpanded
                                                ? "max-w-[150px] translate-x-0 opacity-100 delay-75"
                                                : "max-w-0 -translate-x-3 opacity-0"
                                        }`}
                                    >
                                        Logout
                                    </span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}