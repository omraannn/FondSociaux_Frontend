import { useNavigate } from 'react-router-dom';

export function useHandlePermissionErrors() {
    const navigate = useNavigate();

    const handlePermissionErrors = async  (error:any) => {
        if (error.status === '403') {
            navigate('/auth/access-denied')
        }
    };

    return { handlePermissionErrors };
}
