import {Table, Button, Modal, Image, Tag, Form, Upload, Select} from 'antd';
import { IoMdAdd } from 'react-icons/io';
import {useEffect, useState} from 'react';
import {CustomFilterDropdown, CustomInput, ManagementFormModal} from '../../components/index';
import 'react-quill/dist/quill.snow.css';
import {ExclamationCircleFilled, SearchOutlined, UploadOutlined} from "@ant-design/icons";
import {openNotificationWithIcon} from "../../utils/notificationUtils";
import {handleError} from "../../utils/handleErrors";
import moment from "moment";
import userService from "../../services/userService";
import {IMG_URL} from "../../utils/env";
import roleService from "../../services/roleService";
import {useHandlePermissionErrors} from "../../utils/handlePermissionErrors";



const BASE_URL = IMG_URL;
const { Option } = Select;

const Employees = () => {

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { confirm } = Modal;


    const [frontImageFileList, setFrontImageFileList] = useState<any>([]);
    const [backImageFileList, setBackImageFileList] = useState<any>([]);
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [age, setAge] = useState('');
    const [address, setAddress] = useState('');
    const [cin, setCin] = useState('');
    const [tel, setTel] = useState('');
    const [email, setEmail] = useState('');


    const [confirmedEmployees, setConfirmedEmployees] = useState([]);
    const [currentEmployee, setCurrentEmployee] = useState<any>(null);
    const [errors, setErrors] = useState<any>({});

    const [roles, setRoles] = useState([]);
    const [selectedRoles, setSelectedRoles] = useState([]);

    const [filteredFirstname, setFilteredFirstname] = useState<any>(null);
    const [filteredLastname, setFilteredLastname] = useState<any>(null);
    const [filteredCin, setFilteredCin] = useState<any>(null);
    const [filteredTel, setFilteredTel] = useState<any>(null);
    const [filteredEmail, setFilteredEmail] = useState<any>(null);
    const [filteredAddress, setFilteredAddress] = useState<any>(null);

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });


    const [userPermissions, setUserPermissions] = useState<any>([]);

    const { handlePermissionErrors } = useHandlePermissionErrors();

    const fetchUserPermissions = async () => {
        const permissions = await userService.getUserPermissions();
        console.log(permissions)
        setUserPermissions(permissions);
    };


    useEffect(() => {
        fetchConfirmedEmployee(pagination.current, pagination.pageSize, {
            firstname: filteredFirstname,
            lastname: filteredLastname,
            cin: filteredCin,
            tel: filteredTel,
            email: filteredEmail,
            address: filteredAddress,
        });
        fetchRolesAll();
        fetchUserPermissions();
    }, [pagination.current, pagination.pageSize, filteredFirstname, filteredLastname, filteredCin, filteredTel, filteredEmail, filteredAddress]);




    /*|--------------------------------------------------------------------------
    |  Fetch confirmed employee
    |-------------------------------------------------------------------------- */
    const fetchConfirmedEmployee = async (page = 1, pageSize = 10, filters = {}) => {
        try {
            setIsLoading(true);
            const response = await userService.getConfirmedEmployee(page, pageSize, filters);
            setConfirmedEmployees(response.confirmedUsers);
            setPagination({
                current: page,
                pageSize: pageSize,
                total: response.pagination.total,
            });
        } catch (error) {
            await handlePermissionErrors(error);
            console.error('Error fetching confirmed employees:', error);
            openNotificationWithIcon('error', 'Erreur', 'Erreur lors du chargement des employes confirmés');
        } finally {
            setIsLoading(false);
        }
    };

    const handleTableChange = (pagination: any, filters: any) => {
        const newFilters = {
            firstname: filters.firstname ? filters.firstname[0] : null,
            lastname: filters.lastname ? filters.lastname[0] : null,
            cin: filters.cin ? filters.cin[0] : null,
            tel: filters.tel ? filters.tel[0] : null,
            email: filters.email ? filters.email[0] : null,
            address: filters.address ? filters.address[0] : null,
        };
        setFilteredFirstname(newFilters.firstname);
        setFilteredLastname(newFilters.lastname);
        setFilteredCin(newFilters.cin);
        setFilteredTel(newFilters.tel);
        setFilteredEmail(newFilters.email);
        setFilteredAddress(newFilters.address);

        fetchConfirmedEmployee(pagination.current, pagination.pageSize, newFilters);
    };


    /*|--------------------------------------------------------------------------
    |  Fetch confirmed employee
    |-------------------------------------------------------------------------- */
    const fetchRolesAll = async () => {
        try {
            const response = await roleService.getRolesAll();
            setRoles(response.roles);
        } catch (error) {
            console.error('Erreur lors du chargement des rôles:', error);
        }
    };
    const handleRolesChange = (value:any) => {
        setSelectedRoles(value);
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
                    height={50}
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
                    height={50}
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
            title: 'Rôles',
            dataIndex: 'roles',
            key: 'roles',
            render: (roles:any) => (
                <span>
                {roles.map((role:any) => (
                    <Tag color="blue" key={role.id}>
                        {role.name}
                    </Tag>
                ))}
            </span>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status:any, record:any) => {
                const isInactive = record.roles.length === 1 && record.roles[0].name === 'GUEST';
                return (
                    <Tag color={isInactive ? 'red' : 'green'}>
                        {isInactive ? 'Inactif' : 'Actif'}
                    </Tag>
                );
            }
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
                        userPermissions.length > 0 && userPermissions.includes('mettre à jour un employé') && (
                            <Button size="small" onClick={() => handleEdit(record)}>
                                Modifier
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
    |  Handle modal visibility
    |-------------------------------------------------------------------------- */
    const showAddModal = () => setIsAddModalOpen(true);
    const showEditModal = () => setIsEditModalOpen(true);
    const handleCancel = () => resetStates();


    /*|--------------------------------------------------------------------------
    |  Handle filter functionality
    |-------------------------------------------------------------------------- */
    const handleFirstnameFilter = (value:any) => {
        resetPagination();
        fetchConfirmedEmployee(1, pagination.pageSize, { title: value });
        setFilteredFirstname(value)
    };
    const handleLastnameFilter = (value:any) => {
        resetPagination();
        fetchConfirmedEmployee(1, pagination.pageSize, { title: value });
        setFilteredLastname(value)
    };
    const handleCinFilter = (value:any) => {
        resetPagination();
        fetchConfirmedEmployee(1, pagination.pageSize, { title: value });
        setFilteredCin(value)
    };
    const handleAddressFilter = (value:any) => {
        resetPagination();
        fetchConfirmedEmployee(1, pagination.pageSize, { title: value });
        setFilteredAddress(value)
    };
    const handleEmailFilter = (value:any) => {
        resetPagination();
        fetchConfirmedEmployee(1, pagination.pageSize, { title: value });
        setFilteredEmail(value)
    };
    const handleTelFilter = (value:any) => {
        resetPagination();
        fetchConfirmedEmployee(1, pagination.pageSize, { title: value });
        setFilteredTel(value)
    };

    const resetPagination = () => {
        setPagination(prev => ({
            ...prev,
            current: 1,
        }));
    };


    /*|--------------------------------------------------------------------------
    |  Handle action changes
    |-------------------------------------------------------------------------- */
    const handleFirstname = (e:any) => setFirstname(e.target.value);
    const handleLastname = (e:any) => setLastname(e.target.value);
    const handleAge = (e:any) => setAge(e.target.value);
    const handleAddress = (e:any) => setAddress(e.target.value);
    const handleCin = (e:any) => setCin(e.target.value);
    const handleEmail = (e:any) => setEmail(e.target.value);
    const handleTel = (e:any) => setTel(e.target.value);


    /*|--------------------------------------------------------------------------
   |  Handle add employee
   |-------------------------------------------------------------------------- */
    const handleAddEmployee = async () => {
        console.log(roles)
        try {
            const formData = new FormData();
            formData.append('front_image', frontImageFileList[0]?.originFileObj);
            formData.append('back_image', backImageFileList[0]?.originFileObj);
            formData.append('firstname', firstname);
            formData.append('lastname', lastname);
            formData.append('age', age);
            formData.append('address', address);
            formData.append('cin', cin);
            formData.append('tel', tel);
            formData.append('email', email);
            console.log(selectedRoles)
            formData.append('roles', JSON.stringify(selectedRoles));

            await userService.storeEmployee(formData);
            resetStates();
            openNotificationWithIcon('success', 'Succès', 'employé ajoutée avec succès');
            await fetchConfirmedEmployee();
        } catch (error) {
            await handlePermissionErrors(error);
            handleError(error, setErrors);
        }
    };



    /*|--------------------------------------------------------------------------
    |  Handle update employee
    |-------------------------------------------------------------------------- */
    const handleEdit = (record:any) => {
        const roles = record.roles.map((role:any) => role.name);
        setFirstname(record.firstname)
        setLastname(record.lastname)
        setAge(record.age)
        setAddress(record.address)
        setTel(record.tel)
        setCin(record.cin)
        setEmail(record.email)
        setSelectedRoles(roles)
        setCurrentEmployee(record)
        showEditModal();
    };
    const handleUpdateEmployee = async () => {
        try {
            const formData = new FormData();

            if (frontImageFileList.length > 0 && frontImageFileList[0]?.originFileObj) {
                formData.append('front_image', frontImageFileList[0].originFileObj);
            } else {
                formData.append('front_image', '');
            }


            if (backImageFileList.length > 0 && backImageFileList[0]?.originFileObj) {
                formData.append('back_image', backImageFileList[0].originFileObj);
            } else {
                formData.append('back_image', '');
            }

            formData.append('firstname', firstname);
            formData.append('lastname', lastname);
            formData.append('age', age);
            formData.append('address', address);
            formData.append('cin', cin);
            formData.append('tel', tel);
            formData.append('email', email);
            formData.append('roles', JSON.stringify(selectedRoles));

            const response = await userService.updateProfile(currentEmployee.id, formData);
            console.log(response)
            resetStates();
            openNotificationWithIcon('success', 'Succès', 'Employé mise à jour avec succès');
            await fetchConfirmedEmployee();
        } catch (error) {
            await handlePermissionErrors(error);
            handleError(error, setErrors);
        }
    };


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
                console.log('Annuler');
            },
        });
    };
    const handleDelete = async (key:any) => {
        try {
            await userService.deleteEmployee(key);
            openNotificationWithIcon('success', 'Succès', 'Employee supprimée avec succès');
            await fetchConfirmedEmployee();
        } catch (error) {
            await handlePermissionErrors(error);
            openNotificationWithIcon('error', 'Erreur', "Erreur lors de la suppression de l'employé");
        }
    };


    /*|--------------------------------------------------------------------------
    |  Reset States
    |-------------------------------------------------------------------------- */
    const resetStates = () => {
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        setFirstname('')
        setLastname('')
        setAge('')
        setTel('')
        setEmail('')
        setAddress('')
        setCin('')
        setSelectedRoles([])
        setBackImageFileList([])
        setFrontImageFileList([])
        setErrors({})
        setCurrentEmployee(null);
    }


    /*|--------------------------------------------------------------------------|
    |                                 Start JSX                                  |
    |----------------------------------------------------------------------------|*/
    return (
        <>
            <div>
                <h3 className="mb-4 bg-white p-4">Les employés</h3>
                <div>
                    <div className="mb-2 d-flex justify-content-end">
                        {
                            userPermissions.length > 0 && userPermissions.includes('créer un employé') && (
                                <button className="btn bg-dark text-white" onClick={showAddModal}>
                                    <IoMdAdd className="fs-4"/> Ajouter un employé
                                </button>
                            )
                        }
                    </div>
                    <Table
                        rowKey="id"
                        loading={isLoading}
                        columns={columns}
                        pagination={{
                            current: pagination.current,
                            pageSize: pagination.pageSize,
                            total: pagination.total,
                        }}
                        onChange={handleTableChange}
                        dataSource={confirmedEmployees}
                        scroll={{ x: 'max-content' }}
                    />
                </div>
            </div>


            {/* ------- Add employee ------- */}
            <ManagementFormModal
                title="Ajouter un employé"
                subTitle="Employés"
                open={isAddModalOpen}
                onClose={handleCancel}
                onSubmit={handleAddEmployee}
            >
                <Form layout="vertical">
                    <CustomInput I_class_container="mb-2" type="text" label="Nom" name="firstname" value={firstname} action={handleFirstname} error={errors.firstname} />
                    <CustomInput I_class_container="mb-2" type="text" label="Prénom" name="lastname" value={lastname} action={handleLastname} error={errors.lastname} />
                    <CustomInput I_class_container="mb-2" type="number" label="Age" name="age" value={age} action={handleAge} error={errors.age} />
                    <CustomInput I_class_container="mb-2" type="text" label="CIN" name="cin" value={cin} action={handleCin} error={errors.cin} />
                    <CustomInput I_class_container="mb-2" type="email" label="Email" name="email" value={email} action={handleEmail} error={errors.email} />
                    <CustomInput I_class_container="mb-2" type="tel" label="Téléphone" name="tel" value={tel} action={handleTel} error={errors.tel} />
                    <CustomInput I_class_container="mb-2" type="text" label="Adresse" name="address" value={address} action={handleAddress} error={errors.address} />

                    <Form.Item className="mb-2" name="roles">
                        <Select
                            mode="multiple"
                            placeholder="Sélectionner les rôles"
                            value={selectedRoles}
                            onChange={handleRolesChange}
                        >
                            {roles
                                .filter((role:any) => role.name !== 'RH')
                                .map((filteredRole:any) => (
                                    <Option key={filteredRole.id} value={filteredRole.name}>
                                        {filteredRole.name}
                                    </Option>
                                ))
                            }
                        </Select>
                    </Form.Item>

                    <Form.Item  name="frontImages" className="mb-2">
                        <Upload
                            listType="picture"
                            beforeUpload={() => false}
                            maxCount={1}
                            fileList={frontImageFileList}
                            onChange={({ fileList }) => setFrontImageFileList(fileList)}
                        >
                            <Button icon={<UploadOutlined />}>Télécharger le recto CIN</Button>
                        </Upload>
                        {errors && errors.front_image && <div className="p-1 text-danger">{errors.front_image}</div>}
                    </Form.Item>

                    <Form.Item name="backImages" className="mb-2">
                        <Upload
                            listType="picture"
                            beforeUpload={() => false}
                            maxCount={1}
                            fileList={backImageFileList}
                            onChange={({ fileList }) => setBackImageFileList(fileList)}
                        >
                            <Button icon={<UploadOutlined />}>Télécharger le verso CIN</Button>
                        </Upload>
                        {errors && errors.back_image && <div className="p-1 text-danger">{errors.back_image}</div>}
                    </Form.Item>
                </Form>
            </ManagementFormModal>


            {/* ------- Update employee ------- */}
            <ManagementFormModal
                title="Modifier un employé"
                subTitle="Employés"
                open={isEditModalOpen}
                onClose={handleCancel}
                onSubmit={handleUpdateEmployee}
            >
                <Form layout="vertical">
                    <CustomInput I_class_container="mb-2" type="text" label="Nom" name="firstname" value={firstname} action={handleFirstname} error={errors.firstname}/>
                    <CustomInput I_class_container="mb-2" type="text" label="Prénom" name="lastname" value={lastname} action={handleLastname} error={errors.lastname} />
                    <CustomInput I_class_container="mb-2" type="number" label="Age" name="age" value={age} action={handleAge} error={errors.age} />
                    <CustomInput I_class_container="mb-2" type="text" label="CIN" name="cin" value={cin} action={handleCin} error={errors.cin} />
                    <CustomInput I_class_container="mb-2" type="email" label="Email" name="email" value={email} action={handleEmail} error={errors.email} />
                    <CustomInput I_class_container="mb-2" type="tel" label="Téléphone" name="tel" value={tel} action={handleTel} error={errors.tel} />
                    <CustomInput I_class_container="mb-2" type="text" label="Adresse" name="address" value={address} action={handleAddress} error={errors.address} />


                    <Form.Item className="mb-2">
                        <Select
                            mode="multiple"
                            allowClear
                            placeholder="Sélectionner les rôles"
                            value={selectedRoles}
                            onChange={handleRolesChange}
                        >
                            {roles
                                .filter((role:any) => role.name !== 'RH')
                                .map((filteredRole:any) => (
                                    <Option key={filteredRole.id} value={filteredRole.name}>
                                        {filteredRole.name}
                                    </Option>
                                ))
                            }
                        </Select>
                    </Form.Item>


                    <Form.Item name="frontImages" className="mb-2">
                        <Upload
                            listType="picture"
                            beforeUpload={() => false}
                            maxCount={1}
                            fileList={frontImageFileList}
                            onChange={({ fileList }) => setFrontImageFileList(fileList)}
                        >
                            <Button icon={<UploadOutlined />}>Télécharger le recto CIN</Button>
                            {errors && <div className="p-1 text-danger">{errors.front_images}</div>}
                        </Upload>
                    </Form.Item>
                    <Form.Item name="backImages" className="mb-2">
                        <Upload
                            listType="picture"
                            beforeUpload={() => false}
                            maxCount={1}
                            fileList={backImageFileList}
                            onChange={({ fileList }) => setBackImageFileList(fileList)}
                        >
                            <Button icon={<UploadOutlined />}>Télécharger le verso CIN</Button>
                            {errors && <div className="p-1 text-danger">{errors.back_images}</div>}
                        </Upload>
                    </Form.Item>
                </Form>
            </ManagementFormModal>
        </>
    );
};

export default Employees;