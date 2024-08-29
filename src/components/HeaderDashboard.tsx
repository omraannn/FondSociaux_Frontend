import { MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined } from "@ant-design/icons";
import { IoNotifications } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, Badge, Button, Dropdown, Layout, Space } from 'antd';
import React, { useEffect, useState } from "react";
import notificationService from "../services/notificationService";
import userService from "../services/userService";
const { Header } = Layout;

interface HeaderDashboardProps {
    colorBgContainer: string;
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
}

interface Notification {
    type: 'employé' | 'refundDemand';
    id: number;
    lastname?: string;
    subject?: string;
    message: string;
}

const HeaderDashboard: React.FC<HeaderDashboardProps> = ({ colorBgContainer, collapsed, setCollapsed }) => {
    const [roles, setRoles] = useState<string[]>([]);
    const [notificationsCount, setNotificationsCount] = useState<number>(0);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [profileLink, setProfileLink] = useState<string>('/auth/profile');

    const user = JSON.parse(localStorage.getItem("USER_DETAILS") || '{}');
    const navigate = useNavigate();

    const fetchUserRole = async () => {
        try {
            const roles = await userService.getUserRole();
            setRoles(roles);
            if (Array.isArray(roles)) {
                if (roles.includes('RH')) {
                    setProfileLink("/auth/profile");
                    loadNotifications();
                }else {
                    setProfileLink("/auth/profile");
                }
            }
        } catch (error) {
            console.error('Error fetching user roles:', error);
            setProfileLink("/auth/profile");
        }
    };

    useEffect(() => {
        fetchUserRole();
    }, []);

    const loadNotifications = async () => {
        try {
            const response1 = await notificationService.getPendingEmployeeAll();
            const response2 = await notificationService.getPendingRefundDemandsAll();
            const pendingEmployees = Array.isArray(response1.pendingUsers) ? response1.pendingUsers : [];
            const pendingRefundDemands = Array.isArray(response2.pendingRefunds) ? response2.pendingRefunds : [];
            const totalPending = pendingEmployees.length + pendingRefundDemands.length;
            setNotificationsCount(totalPending);
            const newNotifications = [
                ...pendingEmployees.map((employee: { id: never; lastname: never; }) => ({
                    type: 'employé' as const,
                    id: employee.id,
                    lastname: employee.lastname,
                    message: `Employé ${employee.lastname} en attente.`,
                })),
                ...pendingRefundDemands.map((demand: { id: never; subject: never; }) => ({
                    type: 'refundDemand' as const,
                    id: demand.id,
                    subject: demand.subject,
                    message: `Demande de remboursement du ${demand.subject} en attente.`,
                })),
            ];
            setNotifications(newNotifications);
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    };

    const removeNotification = (id: number) => {
        const updatedNotifications = notifications.filter(notification => notification.id !== id);
        setNotifications(updatedNotifications);
        setNotificationsCount(updatedNotifications.length);
    };

    const handleNotificationClick = (notification: Notification) => {
        if (notification.type === 'employé') {
            navigate('/auth/admin/employees/pending');
        } else if (notification.type === 'refundDemand') {
            navigate('/auth/admin/refunds');
        }
        removeNotification(notification.id);
    };

    const items = notifications.map((notification) => ({
        key: notification.id,
        label: (
            <div
                onClick={() => handleNotificationClick(notification)}
                style={{ maxWidth: '210px', display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '10px' }}
            >
                <div className="row">
                    <Avatar className="col-2" style={{
                        backgroundColor: '#f56a00',
                        verticalAlign: 'middle',
                        width: '30px',
                        height: '30px'
                    }}>
                        {notification.lastname ? notification.lastname.charAt(0) : notification.subject?.charAt(0)}
                    </Avatar>
                    <div className='col-10'>{notification.message}</div>
                </div>
            </div>
        ),
    }));

    return (
        <Header
            className="d-flex justify-content-between align-items-center ps-3 pe-5"
            style={{
                padding: 0,
                background: colorBgContainer,
                zIndex: 1000,
                width: '100%',
            }}
        >
            <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{
                    fontSize: '16px',
                    width: 64,
                    height: 64,
                    zIndex: 1000,
                }}
            />
            <div className="d-flex gap-3 align-items-center">
                {
                    roles.includes('RH') && (
                        <div className="notifications position-relative dropdown">
                            <Dropdown menu={{ items }} placement="bottom">
                                <Badge count={notificationsCount} overflowCount={99}>
                                    <IoNotifications className="fs-4 mt-1" style={{ cursor: 'pointer' }} />
                                </Badge>
                            </Dropdown>
                        </div>
                    )
                }

                <div className="d-flex gap-1 align-items-center">
                    <div className="me-1">
                        <Link to={profileLink}>
                            <Space wrap size={16}>
                                <Avatar shape="square" icon={<UserOutlined />} />
                            </Space>
                        </Link>
                    </div>
                    <div>
                        <h5 className="mb-0 link-reset">{user.lastname}</h5>
                        <p className="mb-0 link-reset">{user.email}</p>
                    </div>
                </div>
            </div>
        </Header>
    );
};

export default HeaderDashboard;
