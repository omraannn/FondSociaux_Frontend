import { AiOutlineDashboard } from "react-icons/ai";
import { BiSolidCategory } from "react-icons/bi";
import { FaCheckCircle, FaClipboardList, FaUnlockAlt, FaUserEdit } from "react-icons/fa";
import { IoShieldCheckmarkSharp } from "react-icons/io5";
import { FaHandHoldingDollar, FaPause } from "react-icons/fa6";
import { Layout, Menu, theme } from 'antd';
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { ImProfile } from "react-icons/im";
import { HeaderDashboard } from "../components";
import userService from "../services/userService";
import { MdHistory, MdPending } from "react-icons/md";

const { Sider, Content } = Layout;

const AuthLayout = () => {
    const [collapsed, setCollapsed] = useState<boolean>(false);
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    const navigate = useNavigate();
    const [userRoles, setUserRoles] = useState<string[]>([]);
    const [userPermissions, setUserPermissions] = useState<string[]>([]);

    useEffect(() => {
        fetchUserPermissions();
        fetchUserRole();
    }, []);

    const fetchUserRole = async () => {
        try {
            const roles = await userService.getUserRole();
            setUserRoles(roles);
        } catch (error) {
            console.error("Error fetching user roles:", error);
        }
    };

    const fetchUserPermissions = async () => {
        try {
            const permissions = await userService.getUserPermissions();
            setUserPermissions(permissions);
        } catch (error) {
            console.error("Error fetching user permissions:", error);
        }
    };

    return (
        <Layout>
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                breakpoint="lg"
                collapsedWidth="0"
                style={{ boxShadow: "0 0 1px", backgroundColor: "white", overflow: 'auto', height: '100vh', position: 'fixed', left: 0, zIndex: 1000 }}
            >
                <div className="admin_logo">
                    <h2 className="fs-5 text-white text-center py-3 mb-0">
                        <span className="sm-logo">RH</span>
                        <span className="lg-logo">Administrateur RH</span>
                    </h2>
                </div>
                <Menu
                    theme="light"
                    mode="inline"
                    defaultSelectedKeys={['']}
                    onClick={({ key }) => {
                        if (key === 'signout') {
                            console.log('logout');
                        } else {
                            navigate(key);
                        }
                    }}
                    items={[
                        ...(userRoles.length === 1 && userRoles.includes('GUEST') ? [
                            {
                                key: 'guest',
                                icon: <MdPending className="fs-5" />,
                                label: 'Bienvenue',
                            },
                        ] : []),

                        ...(userPermissions.includes('voir les statistiques par utilisateur') ? [
                            {
                                key: 'employee',
                                icon: <AiOutlineDashboard className="fs-5" />,
                                label: 'Tableau de bord',
                            },
                        ] : []),

                        ...(userPermissions.includes('voir les statistiques des utilisateurs') ? [
                            {
                                key: 'admin',
                                icon: <AiOutlineDashboard className="fs-5" />,
                                label: 'Tableau de bord',
                            },
                        ] : []),

                        {
                            key: 'profile',
                            icon: <ImProfile className="fs-5" />,
                            label: 'Profile',
                        },

                        ...(userPermissions.includes('voir les remboursements par utilisateur') ? [
                            {
                                key: 'employee/refunds/demand',
                                icon: <FaHandHoldingDollar className="fs-5" />,
                                label: 'Remboursements',
                            },
                        ] : []),

                        ...(userPermissions.includes('voir les remboursements par utilisateur') ? [
                            {
                                key: 'employee/refunds/history',
                                icon: <MdHistory className="fs-5" />,
                                label: 'Historique',
                            },
                        ] : []),

                        ...(userPermissions.includes('voir les catégories') ? [
                            {
                                key: 'admin/categories',
                                icon: <BiSolidCategory className="fs-5" />,
                                label: 'Categories',
                            },
                        ] : []),

                        ...(userPermissions.includes('voir les types de frais') ? [
                            {
                                key: 'admin/frais',
                                icon: <FaClipboardList className="fs-5" />,
                                label: 'Type de frais',
                            },
                        ] : []),

                        ...(userPermissions.includes('voir les politiques') ? [
                            {
                                key: 'admin/policies',
                                icon: <IoShieldCheckmarkSharp className="fs-5" />,
                                label: 'Politiques',
                            },
                        ] : []),

                        ...(userPermissions.includes('voir les rôles') ? [
                            {
                                key: 'admin/roles',
                                icon: <FaUnlockAlt className="fs-5" />,
                                label: 'Roles',
                            }
                        ] : []),

                        ...(userPermissions.includes('voir les employés') ? [
                            {
                                key: 'employees',
                                icon: <FaUserEdit className="fs-5" />,
                                label: 'Employees',
                                children: [
                                    {
                                        key: 'admin/employees/pending',
                                        icon: <FaPause className="fs-5" />,
                                        label: 'En attentes',
                                    },
                                    {
                                        key: 'admin/employees/confirmed',
                                        icon: <FaCheckCircle className="fs-5" />,
                                        label: 'Confirmé',
                                    }
                                ]
                            },
                        ] : []),

                        ...(userPermissions.includes('voir les remboursements des utilisateurs') ? [
                            {
                                key: 'admin/refunds',
                                icon: <FaHandHoldingDollar className="fs-5" />,
                                label: 'Remboursements',
                            },
                        ] : []),
                    ]}
                />
            </Sider>
            <Layout>
                <HeaderDashboard colorBgContainer={colorBgContainer} collapsed={collapsed} setCollapsed={setCollapsed} />
                <Content
                    style={{
                        margin: '10px 0 24px 70px',
                        padding: 24,
                        minHeight: 280,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default AuthLayout;
