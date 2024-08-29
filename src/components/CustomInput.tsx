import { FaRegEye, FaEyeSlash } from "react-icons/fa";
import { useState } from "react";

// Define the props interface


const CustomInput = (props:any) => {
    const {
        type = 'text',
        label,
        I_id,
        I_class,
        action,
        value,
        I_class_container,
        error,
        min = "",
        max = "",
        eye
    } = props;

    const [showPassword, setShowPassword] = useState<string>('password');

    const toggleShowPassword = () => {
        setShowPassword(showPassword === 'password' ? 'text' : 'password');
    };

    return (
        <div className={`form-floating ${I_class_container}`}>
            <input
                className={`form-control ${I_class}`}
                type={eye ? showPassword : type}
                placeholder={label}
                id={I_id}
                onChange={action}
                value={value}
                min={min}
                max={max}
            />
            <label htmlFor={I_id}>{label}</label>
            {eye && (
                <span
                    onClick={toggleShowPassword}
                    style={{
                        position: 'absolute',
                        top: '50%',
                        right: '15px',
                        transform: 'translateY(-50%)',
                        cursor: 'pointer'
                    }}
                >
                    {showPassword === 'password' ? <FaEyeSlash className="fs-6"/> : <FaRegEye className="fs-6"/>}
                </span>
            )}
            {error && <div className="p-1 text-danger">{error}</div>}
        </div>
    );
};

export default CustomInput;
