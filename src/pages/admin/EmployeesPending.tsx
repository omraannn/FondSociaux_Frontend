import {Table, Button, Modal, Image, Tag} from 'antd';
import {useEffect, useState} from 'react';
import {CustomFilterDropdown} from '../../components/index';
import 'react-quill/dist/quill.snow.css';
import {ExclamationCircleFilled, SearchOutlined} from "@ant-design/icons";
import {openNotificationWithIcon} from "../../utils/notificationUtils";
import moment from "moment";
import userService from "../../services/userService";
import {IMG_URL} from "../../utils/env";
import {useHandlePermissionErrors} from "../../utils/handlePermissionErrors";


const BASE_URL = IMG_URL;


const EmployeesPending = () => {

    const [isLoading, setIsLoading] = useState(true);
    const { confirm } = Modal;


    const [pendingEmployees, setPendingEmployees] = useState([]);


    const [filteredFirstname, setFilteredFirstname] = useState<any>(null);
    const [filteredLastname, setFilteredLastname] = useState<any>(null);
    const [filteredCin, setFilteredCin] = useState<any>(null);
    const [filteredTel, setFilteredTel] = useState<any>(null);
    const [filteredEmail, setFilteredEmail] = useState<any>(null);
    const [filteredAddress, setFilteredAddress] = useState<any>(null);

    const [userPermissions, setUserPermissions] = useState<any>([]);

    const { handlePermissionErrors } = useHandlePermissionErrors();

    const fetchUserPermissions = async () => {
        const permissions = await userService.getUserPermissions();
        setUserPermissions(permissions);
    };

    useEffect(() => {
        fetchUserPermissions()
        fetchPendingEmployee()
    }, []);


    /*|--------------------------------------------------------------------------
    |  Handle pending employees
    |-------------------------------------------------------------------------- */
    const fetchPendingEmployee = async () => {
        try {
            setIsLoading(true);
            const response = await userService.getPendingEmployee();
            console.log(response)
            setPendingEmployees(response.pendingUsers.reverse());
        } catch (error) {
            await handlePermissionErrors(error);
            console.error('Error fetching pending employees:', error);
            openNotificationWithIcon('error', 'Erreur', 'Erreur lors du chargement des employes en attente');
        } finally {
            setIsLoading(false);
        }
    };


    /*|--------------------------------------------------------------------------
    |  Handle table columns
    |-------------------------------------------------------------------------- */
    const columns:any = [
        {
            title: 'Nom',
            dataIndex: 'firstname',
            key: 'firstname',
            filterDropdown: (props:any) => (
                <CustomFilterDropdown
                    {...props}
                    placeholder="Rechercher nom"
                    handleFilter={handleFirstnameFilter}
                />
            ),
            onFilter: (value:any, record:any) => record.firstname.toLowerCase().includes(filteredFirstname.toLowerCase()),
            filterIcon: (filtered:any) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
            filteredValue: filteredFirstname ? [filteredFirstname] : null,
        },
        {
            title: 'Prénom',
            dataIndex: 'lastname',
            key: 'lastname',
            filterDropdown: (props:any) => (
                <CustomFilterDropdown
                    {...props}
                    placeholder="Rechercher prénom"
                    handleFilter={handleLastnameFilter}
                />
            ),
            onFilter: (value:any, record:any) => record.lastname.toLowerCase().includes(filteredLastname.toLowerCase()),
            filterIcon: (filtered:any) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
            filteredValue: filteredLastname ? [filteredLastname] : null,
        },
        {
            title: 'Age',
            dataIndex: 'age',
            key: 'age',
            sorter: (a:any, b:any) => a.age - b.age,
        },
        {
            title: 'CIN',
            dataIndex: 'cin',
            key: 'cin',
            filterDropdown: (props:any) => (
                <CustomFilterDropdown
                    {...props}
                    placeholder="Rechercher CIN"
                    handleFilter={handleCinFilter}
                />
            ),
            onFilter: (value:any, record:any) => record.cin.toLowerCase().includes(filteredCin.toLowerCase()),
            filterIcon: (filtered:any) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
            filteredValue: filteredCin ? [filteredCin] : null,
        },
        {
            title: 'Recto CIN',
            dataIndex: 'backImages',
            key: 'frontImages',
            render: (text:any, record:any) => (
                <Image
                    width={100}
                    src={`${BASE_URL}${record.front_image}`}
                    alt="Back Image"
                />
            ),
        },
        {
            title: 'Verso CIN',
            dataIndex: 'backImages',
            key: 'backImages',
            render: (text:any, record:any) => (
                <Image
                    width={100}
                    src={`${BASE_URL}${record.back_image}`}
                    alt="Back Image"
                />
            )
        },
        {
            title: 'Adresse',
            dataIndex: 'address',
            key: 'address',
            filterDropdown: (props:any) => (
                <CustomFilterDropdown
                    {...props}
                    placeholder="Rechercher adresse"
                    handleFilter={handleAddressFilter}
                />
            ),
            onFilter: (value:any, record:any) => record.address.toLowerCase().includes(filteredAddress.toLowerCase()),
            filterIcon: (filtered:any) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
            filteredValue: filteredAddress ? [filteredAddress] : null,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            filterDropdown: (props:any) => (
                <CustomFilterDropdown
                    {...props}
                    placeholder="Rechercher email"
                    handleFilter={handleEmailFilter}
                />
            ),
            onFilter: (value:any, record:any) => record.email.toLowerCase().includes(filteredEmail.toLowerCase()),
            filterIcon: (filtered:any) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
            filteredValue: filteredEmail ? [filteredEmail] : null,
        },
        {
            title: 'Telephone',
            dataIndex: 'tel',
            key: 'tel',
            filterDropdown: (props:any) => (
                <CustomFilterDropdown
                    {...props}
                    placeholder="Rechercher téléphone"
                    handleFilter={handleTelFilter}
                />
            ),
            onFilter: (value:any, record:any) => record.tel.toLowerCase().includes(filteredTel.toLowerCase()),
            filterIcon: (filtered:any) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
            filteredValue: filteredTel ? [filteredTel] : null,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status:any) => (
                <Tag color={status === 0 ? 'red' : 'green'}>
                    {status === 0 ? 'Inactif' : 'Actif'}
                </Tag>
            )
        },
        {
            title: "Date d'ajout",
            dataIndex: 'updated_at',
            key: 'updated_at',
            sorter: (a:any, b:any) => moment(a.created_at).unix() - moment(b.created_at).unix(),
            render: (text:any) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
        },
        {
            title: "Dèrniere modification",
            dataIndex: 'updated_at',
            key: 'updated_at',
            sorter: (a:any, b:any) => moment(a.updated_at).unix() - moment(b.updated_at).unix(),
            render: (text:any) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
        },
        {
            title: 'Action',
            key: 'action',
            align: 'right',
            render: (text:any, record:any) => (
                <div className="d-flex justify-content-end">
                    {
                        userPermissions.length > 0 && userPermissions.includes('confirmer un employé') && (
                            <Button size="small" onClick={() => showAcceptConfirm(record.id)}>
                                Accepter
                            </Button>
                        )
                    }
                    {
                        userPermissions.length > 0 && userPermissions.includes('supprimer un employé') && (
                            <Button type="text" size="small" onClick={() => showDeleteConfirm(record.id)} style={{ marginLeft: 8 }}>
                                Supprimer
                            </Button>
                        )
                    }
                </div>
            ),
        },
    ];


    /*|--------------------------------------------------------------------------
    |  Handle action changes
    |-------------------------------------------------------------------------- */
    const handleFirstnameFilter = (value:any) => setFilteredFirstname(value);
    const handleLastnameFilter = (value:any) => setFilteredLastname(value);
    const handleCinFilter = (value:any) => setFilteredCin(value);
    const handleAddressFilter = (value:any) => setFilteredAddress(value);
    const handleEmailFilter = (value:any) => setFilteredEmail(value);
    const handleTelFilter = (value:any) => setFilteredTel(value);


    /*|--------------------------------------------------------------------------
    |  Handle delete employee
    |-------------------------------------------------------------------------- */
    const showDeleteConfirm = (key:any) => {
        confirm({
            title: 'Êtes-vous sûr de supprimer cet employé?',
            icon: <ExclamationCircleFilled />,
            content: '',
            okText: 'Supprimer',
            okType: 'danger',
            cancelText: 'Annuler',
            onOk() {
                handleDelete(key);
            },
            onCancel() {
                // action canceled
            },
        });
    };
    const handleDelete = async (key:any) => {
        try {
            await userService.deleteEmployee(key);
            openNotificationWithIcon('success', 'Succès', 'Employee supprimée avec succès');
            await fetchPendingEmployee();
        } catch (error) {
            await handlePermissionErrors(error);
            openNotificationWithIcon('error', 'Erreur', "Erreur lors de la suppression de l'employé");
        }
    };


    /*|--------------------------------------------------------------------------
    |  Handle Accept employee
    |-------------------------------------------------------------------------- */
    const showAcceptConfirm = (key:any) => {
        confirm({
            title: "Êtes-vous sûr d'accepter cet employé?",
            icon: <ExclamationCircleFilled />,
            content: '',
            okText: 'Confirmer',
            okType: 'danger',
            cancelText: 'Annuler',
            onOk() {
                handleAccept(key);
            },
            onCancel() {
                // action canceled
            },
        });
    };
    const handleAccept = async (key:any) => {
        try {
            await userService.confirmEmployee(key);
            openNotificationWithIcon('success', 'Succès', 'Employee confirmé avec succès');
            await fetchPendingEmployee();
        } catch (error) {
            await handlePermissionErrors(error);
            openNotificationWithIcon('error', 'Erreur', "Erreur lors de la confirmation de l'employé");
        }
    };


    /*|--------------------------------------------------------------------------|
    |                                 Start JSX                                  |
    |----------------------------------------------------------------------------|*/
    return (
        <>
            <div>
                <h3 className="mb-4 bg-white p-4">Les employés en attentes</h3>
                <div>
                    <Table
                        rowKey="id"
                        loading={isLoading}
                        columns={columns}
                        dataSource={pendingEmployees}
                        scroll={{ x: 'max-content' }}
                    />
                </div>
            </div>
        </>
    );
};

export default EmployeesPending;