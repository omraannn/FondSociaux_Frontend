import {Button, Modal, Space} from "antd";
import {useState} from "react";

/*|--------------------------------------------------------------------------
|  Modal form for [CRUD]
|-------------------------------------------------------------------------- */
const ManagementFormModal = ({ title,subTitle, open, onClose, onSubmit, children }) => {

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await onSubmit();
        } catch (error) {
            console.error("Erreur lors de la soumission:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
       <>
           <Modal title={subTitle} open={open} onOk={handleSubmit} onCancel={onClose} okText="Enregistrer"  okButtonProps={{ disabled: isSubmitting }}
                  footer={[
                      <Button className="login-btn" key="cancel" onClick={onClose}>
                          Annuler
                      </Button>,
                      <Button
                          key="accept"
                          type="primary"
                          onClick={handleSubmit}
                          loading={isSubmitting}
                      >
                          <Space>
                              Enregistrer
                          </Space>
                      </Button>,
                  ]}
           >
               <h3>{title}</h3>
               <div>
                   <form>
                       {children}
                   </form>
               </div>
           </Modal>
       </>
    );
};

export default ManagementFormModal;