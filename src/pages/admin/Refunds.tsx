import { openNotificationWithIcon } from "../../utils/notificationUtils";
import { useEffect, useState } from "react";
import refundService from "../../services/refundService";
import { CustomInput, LoadingSpinner, ManagementFormModal} from "../../components/index";
import {
    Button,
    DatePicker,
    Form,
    Image,
    Modal,
    notification,
    Popconfirm,
    Select,
    Space,
    Table,
    Tag,
    Upload
} from "antd";
import {
    ExclamationCircleOutlined,
    FilePdfOutlined,
    UploadOutlined
} from "@ant-design/icons";
import typeFeesService from "../../services/typeFeesService";
import moment from "moment";
import {IoMdAdd} from "react-icons/io";
import userService from "../../services/userService";
import {handleError} from "../../utils/handleErrors";
import {DOC_URL, IMG_URL} from "../../utils/env";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import 'jspdf-autotable';
import {FaCheck} from "react-icons/fa";
import {AiOutlineClose} from "react-icons/ai";
import {useHandlePermissionErrors} from "../../utils/handlePermissionErrors";


const { Option } = Select;


const Refunds = () => {

    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingBtn, setIsLoadingBtn] = useState(false);


    const [isCommentRHModalOpen, setIsCommentRHModalOpen] = useState(false);
    const [isMessageEmployeeModalOpen, setIsMessageEmployeeModalOpen] = useState(false);
    const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
    const [showedTopNotification, setShowedTopNotification] = useState(false);
    const [isUserDetailsModalOpen, setIsUserDetailsModalOpen] = useState(false);
    const [isRejectRefundModalOpen, setIsRejectRefundModalOpen] = useState(false);
    const [isAcceptRefundModalOpen, setIsAcceptRefundModalOpen] = useState(false);
    const [isTypeFeeModalOpen, setIsTypeFeeModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

    const [subject, setSubject] = useState('');
    const [explanation, setExplanation] = useState('');
    const [amountSpent, setAmountSpent] = useState<any>('');
    const [quantity, setQuantity] = useState('');
    const [expenseDate, setExpenseDate] = useState<any>(null);
    const [fileList, setFileList] = useState([]);
    const [commentRH, setCommentRH] = useState('');
    const [documentUrl, setDocumentUrl] = useState('')
    const [sendCommentRH, setSendCommentRH] = useState("")


    const [typeFee, setTypeFee] = useState('Sélectionner un type de frais');
    const [employee, setEmployee] = useState('Sélectionner un employé par CIN');
    const [selectedStatus, setSelectedStatus] = useState("");
    const [errors, setErrors] = useState<any>({});


    const [selectedUser, setSelectedUser] = useState<any>({});
    const [selectedTypeFee, setSelectedTypeFee] = useState<any>(null);
    const [rejectedRefund, setRejectedRefund] = useState<any>('');
    const [acceptedRefund, setAcceptedRefund] = useState<any>('');


    const [refunds, setRefunds] = useState([]);
    const [typeFees, setTypeFees] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [cinOptions, setCinOptions] = useState<any>([]);


    const [filteredTypeFee, setFilteredTypeFee] = useState<any>(null);
    const [filteredCin, setFilteredCin] = useState<any>(null);
    const [filteredStatus, setFilteredStatus] = useState<any>(null);
    const [filteredPayed, setFilteredPayed] = useState<any>(null);
    const [filteredDate, setFilteredDate] = useState<any>(null);


    const [currentRefund, setCurrentRefund] = useState<any>(null);
    const [selectedRowKeys, setSelectedRowKeys] = useState<any>([]);



    const { handlePermissionErrors } = useHandlePermissionErrors();

    useEffect(() => {
        fetchRefunds();
        fetchTypeFeesAll()
        fetchEmployeesAll()
        if (!showedTopNotification) {
            showTopNotification();
            setShowedTopNotification(true);
        }
    }, []);

    /*|--------------------------------------------------------------------------
    |  Fetch Type Fees for filter functionality
    |-------------------------------------------------------------------------- */
    const fetchTypeFeesAll = async () => {
        try {
            setIsLoading(true);
            const response = await typeFeesService.getTypeFeesAll();
            setTypeFees(response.typeFees.reverse());
        } catch (error) {
            console.error('Error fetching typeFees:', error);
            openNotificationWithIcon('error', 'Erreur', 'Erreur lors du chargement des types de frais');
        } finally {
            setIsLoading(false);
        }
    };

    /*|--------------------------------------------------------------------------
    |  Fetch active employees
    |-------------------------------------------------------------------------- */
    const fetchEmployeesAll = async () => {
        try {
            setIsLoading(true);
            const response = await userService.getConfirmedEmployeeAll();
            if(response.confirmedUsers) {
                setEmployees(response.confirmedUsers.reverse());
                setCinOptions([...new Set(response.confirmedUsers.map((user:any) => user.cin))]);
            }
        } catch (error) {
            console.error('Error fetching employes:', error);
            openNotificationWithIcon('error', 'Erreur', 'Erreur lors du chargement des employés');
        } finally {
            setIsLoading(false);
        }
    };

    /*|--------------------------------------------------------------------------
    |  Fetch auth user refunds
    |-------------------------------------------------------------------------- */
    const fetchRefunds = async (page = 1, pageSize = 10, filters = {}) => {
        try {
            setIsLoading(true);
            const response = await refundService.getRefundDemands(page, pageSize, filters);
            setRefunds(response.refunds);

        } catch (error) {
            await handlePermissionErrors(error);
            console.log(error)
        } finally {
            setIsLoading(false);
        }
    };

    /*|--------------------------------------------------------------------------
    |  Handle reject refund demand
    |-------------------------------------------------------------------------- */
    const rejectRefundDemand = async () => {
        try {
            setIsLoadingBtn(true)
            await refundService.rejectRefundDemand(rejectedRefund, sendCommentRH);
            await fetchRefunds()
            openNotificationWithIcon('success', 'Succès', 'La demande de remboursement a été rejetée avec succès.');
            resetStates()
        } catch (error:any) {
            await handlePermissionErrors(error);
            openNotificationWithIcon("error","Erreur", error.message)
        } finally {
            setIsLoadingBtn(false)
        }
    };

    /*|--------------------------------------------------------------------------
     |  Handle accept refund demand
     |-------------------------------------------------------------------------- */
    const acceptRefundDemand = async () => {
        try {
            setIsLoadingBtn(true);
            await refundService.acceptRefundDemand(acceptedRefund, sendCommentRH);
            await fetchRefunds()
            openNotificationWithIcon('success', 'Succès', 'La demande de remboursement a été acceptée avec succès.');
            resetStates()
        } catch (error:any) {
            await handlePermissionErrors(error);
            openNotificationWithIcon("error","Erreur", error.message)
        } finally {
            setIsLoadingBtn(false)
        }
    }

    /*|--------------------------------------------------------------------------
   |  Handle add demand
   |-------------------------------------------------------------------------- */
    const handleAddDemand = async () => {
        try {
            const formData = new FormData();
            formData.append('user_id', employee);
            formData.append('subject', subject);
            formData.append('type_fee_id', typeFee);
            formData.append('message', explanation);
            formData.append('amount_spent', amountSpent);
            formData.append('quantity', quantity);
            if(expenseDate) {
                formData.append('expense_date',  expenseDate.format('YYYY-MM-DD'));
            } else {
                setErrors("la date de dépense est obligatoire")
            }
            fileList.forEach((file:any) => {
                formData.append('supporting_documents[]', file.originFileObj);
            });
            const response = await refundService.storeRefundDemandByAdmin(formData);

            openNotificationWithIcon('success', 'Succès', response.message);
            await fetchRefunds()
            resetStates()

        } catch (error) {
            await handlePermissionErrors(error);
            console.log(error)
            handleError(error, setErrors);
        }
    }

    /*|--------------------------------------------------------------------------
    |  Delete refund demand by admin
    |-------------------------------------------------------------------------- */
    const handleCancelRefund = async (id:any) => {
        try {
            const response = await refundService.deleteRefundDemand(id);
            if(response.status === 'success'){
                await fetchRefunds()
                openNotificationWithIcon('success', 'Succés', "La demande est supprimer avec Succés");
            }
        } catch (error) {
            await handlePermissionErrors(error);
            console.error('Error fetching refunds:', error);
            openNotificationWithIcon('error', 'Erreur', "Erreur lors de la suppression de la demande");
        }
    }

    /*|--------------------------------------------------------------------------
    |  handle modal visibility
    |-------------------------------------------------------------------------- */
    const showCommentRHModal = (comment:any) => {
        setCommentRH(comment);
        setIsCommentRHModalOpen(true);
    };
    const showMessageEmployeeModal = (record:any) => {
        setSubject(record.subject)
        setExplanation(record.message)
        setIsMessageEmployeeModalOpen(true);
    };
    const showDocumentModal = (url:any) => {
        setDocumentUrl(url);
        setIsDocumentModalOpen(true);
    };
    const showUserDetailsModal = (user:any) => {
        setSelectedUser(user);
        setIsUserDetailsModalOpen(true);
    };
    const showTypeFeeModal = (typeFee:any) => {
        setSelectedTypeFee(typeFee);
        setIsTypeFeeModalOpen(true);
    };
    const showRejectRefundModal = (record:any) => {
        setRejectedRefund(record);
        setIsRejectRefundModalOpen(true);
    };
    const showAcceptRefundModal = (record:any) => {
        setAcceptedRefund(record);
        setIsAcceptRefundModalOpen(true);
    };

    const showAddModal = () => setIsAddModalOpen(true);

    const showUpdateModal = (refund:any) => {
        setCurrentRefund(refund);
        setSubject(refund.subject);
        setExplanation(refund.message);
        setAmountSpent(refund.amount_spent);
        setQuantity(refund.quantity);
        setExpenseDate(refund.expense_date ? moment(refund.expense_date) : null);
        setTypeFee(refund.type_fee_id);
        setSelectedStatus(refund.status)
        setEmployee(refund.user_id)
        if(refund.HR_comment) {
            setSendCommentRH(refund.HR_comment)
        } else {
            setSendCommentRH('')
        }
        console.log(refund)
        const preparedFiles = refund.refund_documents.map((doc:any, index:any) => ({
            uid: doc.id,
            name: "document "+(index + 1),
            refund_id: doc.refund_id,
            document_path: doc.document_path,
        }));
        console.log(preparedFiles)
        setFileList(preparedFiles);
        setIsUpdateModalOpen(true);
    };

    const showTopNotification = () => {
        notification.warning({
            message: 'Message',
            description: (
                <span>Vous avez atteint le plafond dans les lignes colorées en jaune</span>
            ),
            placement: 'top',
        });
    };

    /*|--------------------------------------------------------------------------
   |  update refund
   |-------------------------------------------------------------------------- */
    const handleUpdateRefund = async () => {
        try {
            const formData = new FormData();

            formData.append('amount_spent', amountSpent ? parseFloat(amountSpent).toString() : '');
            formData.append('expense_date',  expenseDate.format('YYYY-MM-DD'));
            formData.append('quantity', quantity ? parseFloat(quantity).toString() : '');
            formData.append('subject', subject);
            formData.append('message', explanation);
            formData.append('type_fee_id', typeFee);
            formData.append('status', selectedStatus);
            formData.append('HR_comment', sendCommentRH);
            fileList.forEach((file:any) => {
                if (file.originFileObj) {
                    formData.append('supporting_documents[]', file.originFileObj);
                }
            });

            const uploadedDocumentIds = fileList.map((file:any) => file.uid);
            formData.append('uploaded_document_ids', JSON.stringify(uploadedDocumentIds));

            const response = await refundService.updateRefundByRh(currentRefund.id, employee, formData);
            console.log(response)
            if (response.status === 'success') {
                await fetchRefunds();
                setIsUpdateModalOpen(false);
                resetStates()
                openNotificationWithIcon('success', 'Succès', 'La demande de remboursement a été mise à jour avec succès');
            }
        } catch (error) {
            await handlePermissionErrors(error);
            console.error('Error updating refund:', error);
            openNotificationWithIcon('error', 'Erreur', "Erreur lors de la mise à jour de la demande de remboursement");
        }
    };

    const handleAddFiles = ({ fileList }:any) => {
        setFileList(fileList);
        console.log(fileList)
    };

    const handleRemoveFile = (file:any) => {
        setFileList((prevFileList) => prevFileList.filter((item:any) => item.uid !== file.uid));
        console.log(fileList)
    };

    const handleTypeFeeChange = (value:any) => {
        setAmountSpent("")
        setQuantity("")
        setTypeFee(value)
    }

    const handleStatusChange = (value:any) => {
        setSelectedStatus(value)
    }

    const handleEmployeeChange = (value:any) => {
        setEmployee(value)
    }

    const handleCancel = () => {
        resetStates()
    };

    const status = [
        { id: 1, value: "accepted", label: "Accepté" },
        { id: 2, value: "rejected", label: "Rejèté" },
        { id: 3, value: "pending", label: "En attente" },
        { id: 4, value: "ceiling_reached", label: "Plafond Atteint" },
    ];

    const payedFiltersOptions = [
        { label: 'Payé', value: 1 },
        { label: 'Non payé', value: 0 },
    ];

    const columns:any = [
        {
            title: 'Type de frais',
            dataIndex: ['type_fee', 'title'],
            key: 'type_fee_title',
            render: (text:any, record:any) => (
                <Button type="link" onClick={() => showTypeFeeModal(record.type_fee)}>
                    {text}
                </Button>
            ),
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }:any) => (
                <div style={{ padding: 8 }}>
                    <Select
                        showSearch
                        placeholder="Sélectionner un type de frais"
                        onChange={value => {
                            setSelectedKeys(value ? [value.toString()] : []);
                            handleTypeFeeFilter(value);
                            confirm();
                        }}
                        value={selectedKeys[0]}
                        style={{ width: 188, marginBottom: 8, display: 'block' }}
                    >
                        {typeFees.map((option:any) => (
                            <Select.Option key={option.id} value={option.title}>
                                {option.title}
                            </Select.Option>
                        ))}
                    </Select>
                    <Button
                        type="dashed"
                        onClick={() => {
                            handleTypeFeeFilter(selectedKeys[0]);
                            confirm();
                        }}
                        size="small"
                        style={{ width: 90, marginRight: 8 }}
                    >
                        Filtrer
                    </Button>
                    <Button
                        onClick={() => {
                            handleTypeFeeFilter(null);
                            clearFilters();
                        }}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Réinitialiser
                    </Button>
                </div>
            ),
            onFilter: (value:any, record:any) => record.type_fee.title.toLowerCase().includes(value.toLowerCase()),
            filteredValue: filteredTypeFee ? [filteredTypeFee.toString()] : null,
        },
        {
            title: 'Employé CIN',
            dataIndex: ['user', 'cin'],
            key: 'user_cin',
            render: (text:any, record:any) => (
                <Button type="link" onClick={() => showUserDetailsModal(record.user)}>
                    {text}
                </Button>
            ),
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }:any) => (
                <div style={{ padding: 8 }}>
                    <Select
                        showSearch
                        placeholder="Rechercher par le CIN"
                        onChange={value => {
                            setSelectedKeys(value ? [value.toString()] : []);
                            handleCinFilter(value);
                            confirm();
                        }}
                        value={selectedKeys[0]}
                        style={{ width: 188, marginBottom: 8, display: 'block' }}
                    >
                        {cinOptions.map((cin:any) => (
                            <Select.Option key={cin} value={cin}>
                                {cin}
                            </Select.Option>
                        ))}
                    </Select>
                    <Button
                        type="dashed"
                        onClick={() => {
                            handleCinFilter(selectedKeys[0]);
                            confirm();
                        }}
                        size="small"
                        style={{ width: 90, marginRight: 8 }}
                    >
                        Filtrer
                    </Button>
                    <Button
                        onClick={() => {
                            handleCinFilter(null);
                            clearFilters();
                        }}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Réinitialiser
                    </Button>
                </div>
            ),
            onFilter: (value:any, record:any) => record.user.cin.toLowerCase().includes(value.toLowerCase()),
            filteredValue: filteredCin ? [filteredCin.toString()] : null,
        },
        {
            title: 'Message Employé',
            dataIndex: 'HR_comment',
            key: 'HR_comment',
            render: (text:any, record:any) => (
                    <span>
                        <Button type="link" onClick={() => showMessageEmployeeModal(record)}>
                            Afficher le message
                        </Button>
                    </span>
            ),
        },
        {
            title: 'Montant dépensé',
            dataIndex: 'amount_spent',
            key: 'amount_spent',
            render: (text:any) => text ? `${text} TND` : <span className='text-danger'>----</span>,
            sorter: (a:any, b:any) => {
                if (a.amount_spent && b.amount_spent) {
                    return a.amount_spent.localeCompare(b.amount_spent);
                }
                return 0;
            },
        },
        {
            title: 'Quantité',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (text:any) => text ? `${text} Unités` : <span className='text-danger'>----</span>,
            sorter: (a:any, b:any) => a.quantity.localeCompare(b.quantity),
        },
        {
            title: 'Montant RM',
            dataIndex: 'reimbursement_amount',
            key: 'reimbursement_amount',
            render: (text:any) => `${text} TND`,
            sorter: (a:any, b:any) => a.reimbursement_amount.localeCompare(b.reimbursement_amount),
        },
        {
            title: 'Date de dépense',
            dataIndex: 'expense_date',
            key: 'expense_date',
        },
        {
            title: 'Statut',
            dataIndex: 'status',
            key: 'status',
            render: (status:any, record:any) => {
                let color;
                let statusLabel;

                switch (status) {
                    case 'accepted':
                        color = 'green';
                        statusLabel = 'Accepté';
                        break;
                    case 'rejected':
                        color = 'red';
                        statusLabel = 'Rejeté';
                        break;
                    case 'pending':
                        color = 'blue';
                        statusLabel = 'En attente';
                        break;
                    default:
                        color = 'blue';
                        statusLabel = status;
                }

                return (
                    <div className="d-flex flex-column align-items-center gap-2">
                        <Tag color={color}>{statusLabel.toUpperCase()}</Tag>
                        {record.ceiling_reached === 1 ? (<Tag color="orange">Plafond Atteint</Tag>) : ""}
                    </div>
                );
            },
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }:any) => (
                <div style={{ padding: 8 }}>
                    <Select
                        showSearch
                        placeholder="Sélectionner un statut"
                        onChange={value => {
                            setSelectedKeys(value ? [value.toString()] : []);
                            handleStatusFilter(value);
                            confirm();
                        }}
                        value={selectedKeys[0]}
                        style={{ width: 188, marginBottom: 8, display: 'block' }}
                    >
                        {status.map(option => (
                            <Select.Option key={option.id} value={option.value}>
                                {option.label}
                            </Select.Option>
                        ))}
                    </Select>
                    <Button
                        type="dashed"
                        onClick={() => {
                            handleStatusFilter(selectedKeys[0]);
                            confirm();
                        }}
                        size="small"
                        style={{ width: 90, marginRight: 8 }}
                    >
                        Filtrer
                    </Button>
                    <Button
                        onClick={() => {
                            handleStatusFilter(null);
                            clearFilters();
                        }}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Réinitialiser
                    </Button>
                </div>
            ),
            onFilter: (value:any, record:any) => {
                if (value === "ceiling_reached") {
                    return record.ceiling_reached === 1;
                }
                return record.status.toLowerCase().includes(value.toLowerCase());
            },
            filteredValue: filteredStatus ? [filteredStatus.toString()] : null,
        },
        {
            title: 'Commentaire RH',
            dataIndex: 'HR_comment',
            key: 'HR_comment',
            render: (text:any) => (
                text ? (
                    <span>
                        <Button type="link" onClick={() => showCommentRHModal(text)}>
                            Afficher le commentaire
                        </Button>
                    </span>
                ) : (<span className="text-danger">----</span>)
            ),
        },
        {
            title: 'Documents',
            dataIndex: 'refund_documents',
            key: 'refund_documents',
            render: (refundDocuments:any) => (
                refundDocuments && refundDocuments.length > 0 ? (
                    <span>
                        {refundDocuments.map((document:any, index:any) => (
                            <Button
                                key={index}
                                type="link"
                                icon={<FilePdfOutlined />}
                                onClick={() => showDocumentModal(document.document_path)}
                            >
                                Document {index + 1}
                            </Button>
                        ))}
                    </span>
                ) : null
            ),
        },
        {
            title: 'Envoyée le',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (text:any) => `${moment(text).format('YYYY-MM-DD [à] HH:mm A')}`,
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }:any) => (
                <div style={{ padding: 8 }}>
                    <DatePicker.RangePicker
                        onChange={(dates:any) => {
                            // dates est un tableau de Moments ou null
                            setSelectedKeys(dates ? [dates] : []);
                            handleDateFilter(dates);
                            confirm();
                        }}
                        value={selectedKeys[0] ? [
                            moment(selectedKeys[0][0], 'YYYY-MM-DD') as any,
                            moment(selectedKeys[0][1], 'YYYY-MM-DD') as any
                        ] : [] as any}
                        style={{ width: 250, marginBottom: 8, display: 'block' }}
                    />
                    <Button
                        type="dashed"
                        onClick={() => confirm()}
                        size="small"
                        style={{ width: 90, marginRight: 8 }}
                    >
                        Filtrer
                    </Button>
                    <Button
                        onClick={() => {
                            clearFilters();
                            handleDateFilter(null);
                            confirm();
                        }}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Réinitialiser
                    </Button>
                </div>
            ),
            onFilter: (value:any, record:any) => {
                if (!value || value.length < 2) return true;
                const [startDate, endDate] = value;
                const recordDate = moment(record.created_at);
                return recordDate.isBetween(startDate, endDate, null, '[]');
            },
            filteredValue: filteredDate ? [filteredDate] : null,
        },
        {
            title: 'Action',
            key: 'action',
            align: 'center',
            render: (text:any, record:any) => (
                <div className="d-flex justify-content-end">
                    {record.payed ? (
                        <Popconfirm
                            title="Êtes-vous sûr de vouloir supprimer cette demande de remboursement?"
                            onConfirm={() => handleCancelRefund(record.id)}
                            okText="Oui"
                            cancelText="Non"
                        >
                            <Button style={{ marginLeft: 8, color: 'red' }} size="small" type="link" className="text-danger">supprimer</Button>
                        </Popconfirm>
                    ) : (
                        <>
                            {record.status === 'pending' ? (
                                <>
                                    <Button className="login-btn" size="small" onClick={() => showAcceptRefundModal(record.id)}>
                                        confirmer
                                    </Button>
                                    <Button type="text" size="small" onClick={() => showRejectRefundModal(record.id)} style={{ marginLeft: 8 }}>
                                        rejeter
                                    </Button>
                                </>
                            ) : (
                                <Button className="login-btn" size="small" onClick={() => showUpdateModal(record)}>
                                    modifier
                                </Button>
                            )}
                            <Popconfirm
                                title="Êtes-vous sûr de vouloir supprimer cette demande de remboursement?"
                                onConfirm={() => handleCancelRefund(record.id)}
                                okText="Oui"
                                cancelText="Non"
                            >
                                <Button style={{ marginLeft: 8, color: 'red' }} size="small" type="link" className="text-danger">supprimer</Button>
                            </Popconfirm>
                        </>
                    )}
                </div>
            ),
        },
        {
            title: 'Payé',
            dataIndex: 'payed',
            key: 'payed',
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }:any) => (
                <div style={{ padding: 8 }}>
                    <Select
                        showSearch
                        placeholder="Sélectionner un état de paiement"
                        options={payedFiltersOptions}
                        onChange={value => {
                            setSelectedKeys(value ? [value.toString()] : []);
                            handlePayedFilter(value);
                            confirm();
                        }}
                        value={selectedKeys[0]}
                        style={{ width: 188, marginBottom: 8, display: 'block' }}
                    />
                    <Button
                        type="dashed"
                        onClick={() => {
                            handlePayedFilter(selectedKeys[0] ? parseInt(selectedKeys[0], 10) : null);
                            confirm();
                        }}
                        size="small"
                        style={{ width: 90, marginRight: 8 }}
                    >
                        Filtrer
                    </Button>
                    <Button
                        onClick={() => {
                            handlePayedFilter(null);
                            clearFilters();
                            confirm();
                        }}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Réinitialiser
                    </Button>
                </div>
            ),
            onFilter: (value:any, record:any) => record.payed === value,
            filteredValue: filteredPayed !== null ? [filteredPayed] : null,
            render: (payed:any) => (payed ? <Tag color="green">Oui</Tag> : <Tag color="red">Non</Tag>),
        },
    ];

    /*|--------------------------------------------------------------------------
    |  Handle filter functionality
    |-------------------------------------------------------------------------- */
    const handleTypeFeeFilter = (value:any) => setFilteredTypeFee(value)
    const handleStatusFilter = (value:any) => setFilteredStatus(value);
    const handleCinFilter = (value:any) => setFilteredCin(value)
    const handlePayedFilter = (value:any) => setFilteredPayed(value);

    const handleDateFilter = (dates:any) => {
        if (dates && dates.length === 2) {
            const [startDate, endDate] = dates;
            setFilteredDate([startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD')]);
        } else {
            setFilteredDate(null);
        }
    };


    const getFilteredRequests = () => {
        return refunds.filter((request:any) => selectedRowKeys.includes(request.id) && request.status === 'accepted');
    };

    const handleSendCommentRH = (e:any) => setSendCommentRH(e.target.value)
    const rowClassName = (record:any) => {
        let className = '';

        if (record.ceiling_reached) {
            className += ' red-row';
        }

        if (record.payed) {
            className += ' green-row';
        } else {
            className += ' ';
        }

        return className.trim();
    };

    const handleTypeFee = (value:any) => {
        setTypeFee(value)
        setAmountSpent("")
        setQuantity("")
    };
    const handleFileChange = ({ fileList }:any) => setFileList(fileList);



    /*|--------------------------------------------------------------------------
    |  Generate pdf rapport for the accepted refund demands
    |-------------------------------------------------------------------------- */
    const handleExportPdf = () => {
        const filteredRequests = getFilteredRequests();
        console.log(filteredRequests);
        const userTotals = filteredRequests.reduce((acc:any, request:any) => {
            const userCIN = request.user.cin;
            if (!acc[userCIN]) {
                acc[userCIN] = {
                    CIN: userCIN,
                    'Nom & Prénom': `${request.user.firstname} ${request.user.lastname}`,
                    Montant: 0,
                };
            }
            acc[userCIN].Montant += parseFloat(request.reimbursement_amount);
            return acc;
        }, {});
        const data = Object.values(userTotals);
        const totalAmount = data.reduce((sum:any, user:any) => sum + user.Montant, 0);
        data.push({
            CIN: '',
            'Nom & Prénom': 'Total Général',
            Montant: totalAmount,
        });
        const doc:any = new jsPDF();
        doc.text("Rapport de l'ordre financière", 14, 15);
        doc.autoTable({
            head: [['CIN', 'Nom & Prénom', 'Montant']],
            body: data.map((row:any) => [row.CIN, row['Nom & Prénom'], row.Montant]),
            startY: 20,
        });
        doc.save('ordre_financière.pdf');
    };


    /*|--------------------------------------------------------------------------
    |  Generate detailed pdf rapport for the accepted refund demands
    |-------------------------------------------------------------------------- */
    const handleExportDetailedPdf = () => {
        const filteredRequests = getFilteredRequests();
        const data = filteredRequests.map((request:any) => ({
            'CIN': request.user.cin,
            'Type de frais': request.type_fee.title,
            'Nom & Prénom': `${request.user.firstname} ${request.user.lastname}`,
            'Montant': request.reimbursement_amount,
        }));
        const totalAmount = filteredRequests.reduce((sum:any, request:any) => sum + parseFloat(request.reimbursement_amount), 0);
        data.push({
            'CIN': '',
            'Type de frais': '',
            'Nom & Prénom': 'Total Général',
            'Montant': totalAmount,
        });
        const doc:any = new jsPDF();
        doc.text("Rapport Détailé de l'ordre financière", 14, 15);
        const columns = ['CIN', 'Type de frais', 'Nom & Prénom', 'Montant'];
        doc.autoTable({
            head: [columns],
            body: data.map(row => [row['CIN'], row['Type de frais'], row['Nom & Prénom'], row['Montant']]),
            startY: 25,
        });
        doc.save('ordre_financière_detaillé.pdf');
    };


    /*|--------------------------------------------------------------------------
    |  Generate excel file for the accepted refund demands
    |-------------------------------------------------------------------------- */
    const handleExportExcel = () => {
        const filteredRequests = getFilteredRequests();
        console.log(filteredRequests)
        const userTotals = filteredRequests.reduce((acc:any, request:any) => {
            const userCIN = request.user.cin;
            if (!acc[userCIN]) {
                acc[userCIN] = {
                    'CIN': userCIN,
                    'Nom & Prénom': `${request.user.firstname} ${request.user.lastname}`,
                    'Montant': 0,
                };
            }
            acc[userCIN]['Montant'] += parseFloat(request.reimbursement_amount);
            return acc;
        }, {});
        const data = Object.values(userTotals);
        const totalAmount = data.reduce((sum:any, user:any) => sum + user['Montant'], 0);
        data.push({
            'CIN': '',
            'Nom & Prénom': 'Total Général',
            'Montant': totalAmount,
        });
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Demandes de remboursement');
        XLSX.writeFile(workbook, 'ordre_financière.xlsx');
    };


    /*|--------------------------------------------------------------------------
    |  Generate detailed excel file for the accepted refund demands
    |-------------------------------------------------------------------------- */
    const handleExportDetailedExcel = () => {
        const filteredRequests = getFilteredRequests();

        const data:any = filteredRequests.map((request:any) => ({
            'CIN': request.user.cin,
            'Type de frais': request.type_fee.title,
            'Nom & Prénom': `${request.user.firstname} ${request.user.lastname}`,
            'Montant': request.reimbursement_amount,
        }));

        const totalAmount = filteredRequests.reduce((sum:any, request:any) => sum + parseFloat(request.reimbursement_amount), 0);

        data.push({
            'CIN': '',
            'Nom & Prénom': 'Total Général',
            'Montant': totalAmount,
        });

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Demandes de remboursement');

        XLSX.writeFile(workbook, 'ordre_financière_detaillé.xlsx');
    }


    /*|--------------------------------------------------------------------------
     |  update payed status by admin
     |-------------------------------------------------------------------------- */
    const updatePayedStatus = async (ids:any, payed:any) => {
        setIsLoading(true);
        try {
            await refundService.updatePayedStatus(ids, payed);
            openNotificationWithIcon('success', 'Succès', 'Statut de remboursement mis à jour avec succès.');
            // Update local state after successful API call
            setRefunds((prevRefunds:any) =>
                prevRefunds.map((refund:any) =>
                    ids.includes(refund.id) ? { ...refund, payed } : refund
                )
            );
        } catch (error) {
            await handlePermissionErrors(error);
            openNotificationWithIcon('error', 'Erreur', 'Erreur lors de la mise à jour des statuts de remboursement.');
        }
        setIsLoading(false);
    };
    const handleMarkAsPaid = async () => {
        await updatePayedStatus(selectedRowKeys, true);
        setSelectedRowKeys([]); // Clear selection after updating
    };
    const handleMarkAsNotPaid = async () => {
        await updatePayedStatus(selectedRowKeys, false);
        setSelectedRowKeys([]); // Clear selection after updating
    };
    const onSelectChange = (newSelectedRowKeys:any) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };
    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    };


    /*|--------------------------------------------------------------------------
    |  Handle reset states
    |-------------------------------------------------------------------------- */
    const resetStates = () => {
        setIsAddModalOpen(false);
        setIsUpdateModalOpen(false)
        setIsMessageEmployeeModalOpen(false);
        setIsRejectRefundModalOpen(false);
        setIsAcceptRefundModalOpen(false);
        setRejectedRefund('');
        setAcceptedRefund('');
        setSendCommentRH('');
        setCurrentRefund(null)
        setIsCommentRHModalOpen(false);
        setIsDocumentModalOpen(false);
        setIsTypeFeeModalOpen(false);
        setSelectedTypeFee(null);
        setSubject('');
        setExplanation('');
        setAmountSpent('');
        setExpenseDate(null);
        setQuantity("")
        setFileList([]);
        setEmployee('Sélectionner un employé par CIN');
        setTypeFee('Sélectionner un type de frais');
        setErrors({});
    }


    if (isLoading) {
        return <LoadingSpinner />;
    }

    /*|--------------------------------------------------------------------------|
    |                                 Start JSX                                  |
    |----------------------------------------------------------------------------|*/
    return (
        <>
            <div className="refund-demand-wrapper me-3" style={{ width: '100%' }}>
                <h3 className="mb-4 fs-4 bg-white p-4 w-100">Demandes des remboursements</h3>
                <div className="refund-history-content">
                    <div className="mb-2 d-flex justify-content-between">
                        <button className="btn bg-dark text-white" onClick={showAddModal}>
                            <IoMdAdd className="fs-4"/> Ajouter une demande
                        </button>

                       <div>
                           <Button onClick={handleExportPdf}>Exporter en PDF</Button>
                           <Button onClick={handleExportDetailedPdf}>Exporter en PDF (detaillé)</Button>
                           <Button onClick={handleExportExcel}>Exporter en Excel</Button>
                           <Button type="default" onClick={handleExportDetailedExcel}>
                               Exporter en Excel (detaillé)
                           </Button>
                       </div>

                       <div className="gap-2 d-flex">
                           <Button
                               type="default"
                               onClick={handleMarkAsPaid}
                               disabled={selectedRowKeys.length === 0}
                               loading={isLoading}
                           >
                               <FaCheck/> Marquer comme payé
                           </Button>

                           <Button
                               type="default"
                               onClick={handleMarkAsNotPaid}
                               disabled={selectedRowKeys.length === 0}
                               loading={isLoading}
                           >
                               <AiOutlineClose /> Marquer comme non payé
                           </Button>
                       </div>
                    </div>
                    <Table
                        rowKey="id"
                        rowSelection={rowSelection}
                        loading={isLoading}
                        columns={columns}
                        dataSource={refunds}
                        rowClassName={rowClassName}
                        scroll={{x: 'max-content'}}
                    />
                </div>

                {/* ------- RH comment Modal ------- */}
                <Modal
                    title="Commentaire admin RH"
                    open={isCommentRHModalOpen}
                    onCancel={handleCancel}
                    footer={[
                        <Button className="login-btn" key="cancel" onClick={handleCancel}>
                            Fermer
                        </Button>,
                    ]}
                >
                    <p>{commentRH}</p>
                </Modal>


                {/* ------- Message employee details Modal ------- */}
                <Modal
                    title="Message"
                    open={isMessageEmployeeModalOpen}
                    onCancel={handleCancel}
                    footer={[
                        <Button className="login-btn" key="cancel" onClick={handleCancel}>
                            Fermer
                        </Button>,
                    ]}
                >
                    <div className="mb-2"><strong>Sujet de la demande: </strong>  {subject}</div>
                    <div><strong>Message: </strong></div>
                    <p>{explanation}</p>
                </Modal>


                {/* ------- Documents Modal ------- */}
                <Modal
                    title="Document"
                    open={isDocumentModalOpen}
                    onCancel={handleCancel}
                    footer={[
                        <Button className="login-btn" key="cancel" onClick={handleCancel}>
                            Fermer
                        </Button>,
                    ]}
                >
                    <iframe src={`${DOC_URL}${documentUrl}`} width="100%" height="500px" />
                </Modal>


                {/* ------- User details Modal ------- */}
                {
                    selectedUser && (
                        <Modal
                            open={isUserDetailsModalOpen}
                            onCancel={() => setIsUserDetailsModalOpen(false)}
                            footer={null}
                        >
                            <div className="content">
                                <div className="receipt">
                                    <div className="head border-bottom pb-2 mb-4">
                                        <h1 className="fs-4 text-secondary mb-4 mt-4">
                                            Les informations du collaborateur
                                        </h1>
                                        <div className="row">
                                            <div className="col-md-12 mb-2">
                                                <div className="account-item">
                                                    <span className="fs-6 text--gray me-2">Nom et prénom:</span>
                                                    <span
                                                        className="fs-6">{selectedUser.firstname} {selectedUser.lastname}</span>
                                                </div>
                                            </div>
                                            <div className="col-md-12 mb-2">
                                                <div className="account-item">
                                                    <span className="fs-6 text--gray me-2">Age:</span>
                                                    <span className="fs-6">{selectedUser.age}</span>
                                                </div>
                                            </div>
                                            <div className="col-md-12 mb-2">
                                                <div className="account-item">
                                                    <span className="fs-6 text--gray me-2">Télephone:</span>
                                                    <span className="fs-6">(+216) {selectedUser.tel}</span>
                                                </div>
                                            </div>
                                            <div className="col-md-12 mb-2">
                                                <div className="account-item">
                                                    <span className="fs-6 text--gray me-2">Email:</span>
                                                    <span className="fs-6">{selectedUser.email}</span>
                                                </div>
                                            </div>
                                            <div className="col-md-12 mb-2">
                                                <div className="account-item">
                                                    <span className="fs-6 text--gray me-2">Adresse:</span>
                                                    <span className="fs-6">{selectedUser.address}</span>
                                                </div>
                                            </div>
                                            <div className="col-md-12 mb-2">
                                                <div className="account-item">
                                                    <span className="fs-6 text--gray me-2">CIN:</span>
                                                    <span className="fs-6">{selectedUser.cin}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="head pb-2 mb-3">
                                        <h1 className="fs-5 text-secondary mb-4">{selectedUser.name}</h1>
                                        <div className="d-flex justify-content-center align-items-center gap-2 flex-wrap">
                                            <div className="p-2 bg-white">
                                                <div className="account-item">
                                                    <Image
                                                        width={200}
                                                        src={`${IMG_URL}${selectedUser.front_image}`}
                                                        alt="front Image"
                                                        height={100}
                                                    />
                                                </div>
                                            </div>
                                            <div className="p-2 bg-white">
                                                <div className="account-item">
                                                    <Image
                                                        width={200}
                                                        height={100}
                                                        src={`${IMG_URL}${selectedUser.back_image}`}
                                                        alt="Back Image"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Modal>
                    )
                }


                {/* ------- Add refund demand ------- */}
                <ManagementFormModal
                    title="Ajouter une demande"
                    subTitle="Demandes de remboursements"
                    open={isAddModalOpen}
                    onClose={handleCancel}
                    onSubmit={handleAddDemand}
                >
                    <div>
                        {employee !== "Sélectionner un employé par CIN" && (
                            <div className="p-4 bg-white m-3">
                                <h6 className="mb-3 text-center">Informations sur l employé sélectionné</h6>
                                {employees.map((emp:any) => (
                                    emp.id === employee && (
                                        <div key={emp.id}>
                                            <p className="mb-2"><strong>Nom</strong> {emp.firstname}</p>
                                            <p className='mb-2'><strong>Prénom:</strong> {emp.lastname}</p>
                                            <p className='mb-2'><strong>Email:</strong> {emp.email}</p>
                                            <p className='mb-2'><strong>Tel:</strong> {emp.tel}</p>
                                            <p className='mb-2'><strong>Adresse:</strong> {emp.address}</p>
                                        </div>
                                    )
                                ))}
                            </div>
                        )}
                    </div>

                    <Form.Item
                        className="mb-2"
                        validateStatus={errors.user_id && 'error'}
                        help={errors.user_id}
                    >
                        <Select
                            showSearch
                            onChange={(value) => setEmployee(value)}
                            placeholder="Sélectionner un employé par CIN"
                            value={employee}
                            filterOption={(input:any, option:any) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                        >
                            {employees && employees.length > 0 ? (
                                employees.map((emp:any) => (
                                    <Option key={emp.id} value={emp.id} className="p-2">
                                        {emp.cin}
                                    </Option>
                                ))
                            ) : (
                                <Option disabled value={null}>Aucun employé disponible</Option>
                            )}
                        </Select>
                    </Form.Item>

                    <CustomInput
                        I_class_container="mb-2"
                        type="text"
                        label="Sujet"
                        name="subject"
                        value={subject}
                        action={(e:any) => setSubject(e.target.value)}
                        error={errors.subject}
                    />

                    <CustomInput
                        I_class_container="mb-2"
                        I_class='pt-5 pb-5'
                        type="text"
                        label="Explication"
                        name="message"
                        value={explanation}
                        action={(e:any) => setExplanation(e.target.value)}
                        error={errors.message}
                    />

                    <div>
                        {typeFee !== "Sélectionner un type de frais" && (
                            <div className="p-4 bg-white m-3">
                                <h6 className="mb-3 text-center">Informations sur le type de frais</h6>
                                {typeFees.map((fee:any) => (
                                    fee.id === typeFee && (
                                        <div key={fee.id}>
                                            <p className="mb-2"><strong>Titre :</strong> {fee.title}</p>
                                            <p className="mb-2"><strong>Plafond: </strong> {fee.ceiling} TND</p>
                                            {
                                                fee.refund_type === "percentage" ?  (
                                                    <p className='mb-2'><strong>Pourcentage: </strong> {fee.percentage}%</p>
                                                ) : (
                                                    <p className='mb-2'><strong>Prix unitaire: </strong> {fee.unit_price} TND</p>
                                                )
                                            }
                                            <div className='mb-2'><strong>Les documents demandé:</strong>
                                                <div className="mb-5"
                                                     dangerouslySetInnerHTML={{__html: fee.description}}/>
                                            </div>
                                        </div>
                                    )
                                ))}
                            </div>
                        )}
                    </div>

                    <Form.Item
                        validateStatus={errors.type_fee_id && 'error'}
                        help={errors.type_fee_id}
                        className="mb-2"
                    >
                        <Select
                            showSearch
                            onChange={handleTypeFee}
                            placeholder="Sélectionner un type de frais"
                            value={typeFee}
                            filterOption={(input:any, option:any) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                        >
                            {typeFees && typeFees.length > 0 ? (
                                typeFees.map((fee:any) => (
                                    <Option key={fee.id} value={fee.id} className="p-2">
                                        {fee.title}
                                    </Option>
                                ))
                            ) : (
                                <Option disabled value={null}>Aucun type de frais disponible</Option>
                            )}
                        </Select>
                    </Form.Item>

                    {typeFee !== "Sélectionner un type de frais" && (
                        <div>
                            {typeFees.map((fee:any) => (
                                fee.id === typeFee && (
                                    <div key={fee.id}>
                                        {fee.refund_type === "percentage" ? (
                                            <CustomInput
                                                I_class_container="mb-2"
                                                type="number"
                                                label="Montant dépensé en TND"
                                                name="amount_spent"
                                                value={amountSpent}
                                                action={(e:any) => setAmountSpent(e.target.value)}
                                                error={errors.amount_spent}
                                            />

                                        ) : (
                                            <>
                                                <CustomInput
                                                    I_class_container="mb-2"
                                                    type="number"
                                                    label="Le nombre des pièces"
                                                    name="unity_number"
                                                    value={quantity}
                                                    action={(e:any) => setQuantity(e.target.value)}
                                                    error={errors.quantity}
                                                />
                                            </>
                                        )}
                                    </div>
                                )
                            ))}
                        </div>
                    )}

                    <Form.Item
                        className="mb-2 w-100"
                        validateStatus={errors.expense_date && 'error'}
                        help={errors.expense_date}
                        style={{width: "100%"}}
                    >
                        <DatePicker
                            value={expenseDate}
                            onChange={date => setExpenseDate(date)}
                            style={{ width: '100%' }}
                            placeholder="Sélectionner la date de dépense"
                        />
                    </Form.Item>

                    <Form.Item
                        validateStatus={errors.supporting_documents && 'error'}
                        help={errors.supporting_documents}
                        className='mb-5'
                    >
                        <Upload
                            multiple
                            fileList={fileList}
                            onChange={handleFileChange}
                            beforeUpload={() => false}
                            accept=".pdf"
                        >
                            <Button icon={<UploadOutlined/>}>Télécharger Documents Justificatifs PDF</Button>
                        </Upload>
                    </Form.Item>

                </ManagementFormModal>

                {/* ------- reject refund demand Modal ------- */}
                <Modal
                    title="Rejeter la demande de remboursement"
                    open={isRejectRefundModalOpen}
                    onCancel={handleCancel}
                    footer={[
                        <Button className="login-btn" key="cancel" onClick={handleCancel}>
                            Annuler
                        </Button>,
                        <Button
                            key="reject"
                            type="primary"
                            danger
                            onClick={rejectRefundDemand}
                            loading={isLoadingBtn}
                        >
                            <Space>
                                <ExclamationCircleOutlined/> Rejeter
                            </Space>
                        </Button>,
                    ]}
                >
                    <p>Êtes-vous sûr de vouloir rejeter cette demande de remboursement ?</p>
                    <CustomInput
                        label="Raison de rejet (optionnel)"
                        value={sendCommentRH}
                        action={handleSendCommentRH}
                    />
                </Modal>

                {/* ------- accept refund demand Modal ------- */}
                <Modal
                    title="Accepter la demande de remboursement"
                    open={isAcceptRefundModalOpen}
                    onCancel={handleCancel}
                    footer={[
                        <Button className="login-btn" key="cancel" onClick={handleCancel}>
                            Annuler
                        </Button>,
                        <Button
                            key="accept"
                            type="primary"
                            danger
                            onClick={acceptRefundDemand}
                            loading={isLoadingBtn}
                        >
                            <Space>
                                <ExclamationCircleOutlined/> Accepter
                            </Space>
                        </Button>,
                    ]}
                >
                    <p>Êtes-vous sûr de vouloir accepter cette demande de remboursement ?</p>
                    <CustomInput
                        label="Commentaire (optionnel)"
                        value={sendCommentRH}
                        action={handleSendCommentRH}
                    />
                </Modal>

                {/* ------- Fee type details Modal ------- */}
                {
                    selectedTypeFee && (
                        <Modal
                            open={isTypeFeeModalOpen}
                            onCancel={handleCancel}
                            footer={null}
                        >
                            <div className="content">
                                <div className="receipt">
                                    <div className="head border-bottom pb-2 mb-4">
                                        <h1 className="fs-4 text-secondary mb-4 mt-4">
                                            Les informations du type de frais
                                        </h1>
                                        <div className="row">
                                            <div className="col-md-12 mb-2">
                                                <div className="account-item">
                                                    <span className="fs-6 text--gray me-2">Titre:</span>
                                                    <span
                                                        className="fs-6">{selectedTypeFee.title}</span>
                                                </div>
                                            </div>
                                            <div className="col-md-12 mb-2">
                                                <div className="account-item">
                                                    <span className="fs-6 text--gray me-2">Plafond:</span>
                                                    {
                                                        selectedTypeFee.ceiling_type === 'none' && (
                                                            <span className="fs-6 text-danger">aucun plafond pour ce type</span>
                                                        )
                                                    }
                                                    {
                                                        selectedTypeFee.ceiling_type === 'per_year' && (
                                                            <span className="fs-6 text-danger">{selectedTypeFee.ceiling} TND/Année</span>
                                                        )
                                                    }
                                                    {
                                                        selectedTypeFee.ceiling_type === 'per_day' && (
                                                            <span className="fs-6 text-danger">{selectedTypeFee.ceiling} TND/Jour</span>
                                                        )
                                                    }
                                                </div>
                                            </div>
                                            {
                                                selectedTypeFee.refund_type === 'percentage' ? (
                                                    <div className="col-md-12 mb-2">
                                                        <div className="account-item">
                                                            <span className="fs-6 text--gray me-2">Pourcentage :</span>
                                                            <span className="fs-6">{selectedTypeFee.percentage} %</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="col-md-12 mb-2">
                                                        <div className="account-item">
                                                            <span className="fs-6 text--gray me-2">Prix unitaire :</span>
                                                            <span className="fs-6">{selectedTypeFee.unit_price} TND</span>
                                                        </div>
                                                    </div>
                                                )
                                            }
                                        </div>
                                    </div>

                                    <div className="head pb-2 mb-3">
                                        <div className="col-md-12 mb-2">
                                            <div className="account-item">
                                                <div dangerouslySetInnerHTML={{__html: selectedTypeFee.description}}/>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </Modal>
                    )
                }

                {/* ------- update refund Modal ------- */}
                <ManagementFormModal
                    title="Modifier la demande"
                    subTitle="Demande de remboursement"
                    open={isUpdateModalOpen}
                    onClose={handleCancel}
                    onSubmit={handleUpdateRefund}
                >

                    {employee !== "Sélectionner un employé par CIN" && (
                        <div className="p-4 bg-white m-3">
                            <h6 className="mb-3 text-center">Informations sur l employé sélectionné</h6>
                            {employees.map((emp:any) => (
                                emp.id === employee && (
                                    <div key={emp.id}>
                                        <p className="mb-2"><strong>Nom</strong> {emp.firstname}</p>
                                        <p className='mb-2'><strong>Prénom:</strong> {emp.lastname}</p>
                                        <p className='mb-2'><strong>Email:</strong> {emp.email}</p>
                                        <p className='mb-2'><strong>Tel:</strong> {emp.tel}</p>
                                        <p className='mb-2'><strong>Adresse:</strong> {emp.address}</p>
                                    </div>
                                )
                            ))}
                        </div>
                    )}

                    <Form.Item
                        className="mb-2"
                        validateStatus={errors.employee ? 'error' : ''}
                        help={errors.employee}
                    >
                        <Select
                            value={employee}
                            onChange={handleEmployeeChange}
                        >
                            {employees.map((employee:any) => (
                                <Option key={employee.id} value={employee.id}>
                                    {employee.cin}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <CustomInput
                        I_class_container="mb-2"
                        type="text"
                        label="Sujet"
                        name="subject"
                        value={subject}
                        action={(e:any) => setSubject(e.target.value)}
                        error={errors.subject}
                    />

                    <CustomInput
                        I_class_container="mb-2"
                        type="text"
                        label="Explanation"
                        name="explanation"
                        value={explanation}
                        action={(e:any) => setExplanation(e.target.value)}
                        error={errors.explanation}
                    />

                    <div>
                        {typeFee !== "Sélectionner un type de frais" && (
                            <div className="p-4 bg-white m-3">
                                <h6 className="mb-3 text-center">Informations sur le type de frais</h6>
                                {typeFees.map((fee:any) => (
                                    fee.id === typeFee && (
                                        <div key={fee.id}>
                                            <p className="mb-2"><strong>Titre :</strong> {fee.title}</p>
                                            <p className="mb-2"><strong>Plafond: </strong> {fee.ceiling} TND</p>
                                            {
                                                fee.refund_type === "percentage" ? (
                                                    <p className='mb-2'><strong>Pourcentage: </strong> {fee.percentage}%
                                                    </p>
                                                ) : (
                                                    <p className='mb-2'><strong>Prix
                                                        unitaire: </strong> {fee.unit_price} TND</p>
                                                )
                                            }
                                            <div className='mb-2'><strong>Les documents demandé:</strong>
                                                <div className="mb-5"
                                                     dangerouslySetInnerHTML={{__html: fee.description}}/>
                                            </div>
                                        </div>
                                    )
                                ))}
                            </div>
                        )}
                    </div>

                    <Form.Item
                        className="mb-2"
                        validateStatus={errors.typeFee ? 'error' : ''}
                        help={errors.typeFee}
                    >
                        <Select
                            value={typeFee}
                            onChange={handleTypeFeeChange}
                        >
                            {typeFees.map((fee:any) => (
                                <Option key={fee.id} value={fee.id}>
                                    {fee.title}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    {typeFee !== "Sélectionner un type de frais" && (
                        <div>
                            {typeFees.map((fee:any) => (
                                fee.id === typeFee && (
                                    <div key={fee.id}>
                                        {fee.refund_type === "percentage" ? (
                                            <CustomInput
                                                I_class_container="mb-2"
                                                type="number"
                                                label="Montant dépensé en TND"
                                                name="amount_spent"
                                                value={amountSpent}
                                                action={(e:any) => setAmountSpent(e.target.value)}
                                                error={errors.amount_spent}
                                            />

                                        ) : (
                                            <>
                                                <CustomInput
                                                    I_class_container="mb-2"
                                                    type="number"
                                                    label="Le nombre des pièces"
                                                    name="unity_number"
                                                    value={quantity}
                                                    action={(e:any) => setQuantity(e.target.value)}
                                                    error={errors.quantity}
                                                />
                                            </>
                                        )}
                                    </div>
                                )
                            ))}
                        </div>
                    )}

                    <Form.Item
                        className="mb-2"
                        validateStatus={errors.expenseDate ? 'error' : ''}
                        help={errors.expenseDate}
                    >
                        <DatePicker
                            value={expenseDate}
                            onChange={(date) => setExpenseDate(date)}
                            format="DD/MM/YYYY"
                            style={{width: '100%'}}
                        />
                    </Form.Item>

                    <Form.Item
                        className="mb-2"
                        validateStatus={errors.status ? 'error' : ''}
                        help={errors.status}
                    >
                        <Select
                            value={selectedStatus}
                            onChange={handleStatusChange}
                        >
                            {status.filter((s) => s.id !== 4)
                                .map((s) => (
                                    <Select.Option key={s.id} value={s.value}>
                                        {s.label}
                                    </Select.Option>
                                ))
                            }
                        </Select>
                    </Form.Item>

                    <CustomInput
                        I_class_container="mb-2"
                        type="text"
                        label="Commentaire RH"
                        name="HR_comment"
                        value={sendCommentRH}
                        action={(e:any) => setSendCommentRH(e.target.value)}
                        error={errors.HR_comment}
                    />

                    <Form.Item>
                        <Upload
                            fileList={fileList}
                            onRemove={handleRemoveFile}
                            beforeUpload={() => false}
                            onChange={handleAddFiles}
                            multiple
                        >
                            <Button icon={<UploadOutlined/>}>Ajouter des fichiers</Button>
                        </Upload>
                    </Form.Item>
                </ManagementFormModal>
            </div>
        </>
    );
};

export default Refunds;