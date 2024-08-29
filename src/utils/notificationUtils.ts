import { notification } from "antd";

/*--------------------------------------------------------------------------
|  Handle notifications
|-------------------------------------------------------------------------- */
type NotificationType = 'success' | 'error' | 'info' | 'warning';

export const openNotificationWithIcon = (type: NotificationType, title: string, message: string) => {
    notification[type]({
        message: title,
        description: message,
    });
};