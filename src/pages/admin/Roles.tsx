import { useEffect, useState } from 'react';
import {Table, Button, Modal, Select, Tag} from 'antd';
import { IoMdAdd } from 'react-icons/io';

import 'react-quill/dist/quill.snow.css';
import {ExclamationCircleFilled, SearchOutlined} from '@ant-design/icons';
import { openNotificationWithIcon } from '../../utils/notificationUtils';

import { handleError } from '../../utils/handleErrors';
import { CustomInput, ManagementFormModal } from '../../components/index.js';
import {CustomFilterDropdown} from "../../components/index";
import roleService from "../../services/roleService";
import {useHandlePermissionErrors} from "../../utils/handlePermissionErrors";

const { Option } = Select;
const { confirm } = Modal;

const Roles = () => {

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);


    const [title, setTitle] = useState('');
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [selectedPermissions, setSelectedPermissions] = useState([]);


    const [currentRole, setCurrentRole] = useState<any>(null);


    const [errors, setErrors] = useState<any>({});
    const [filteredTitle, setFilteredTitle] = useState<any>(null);

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    const { handlePermissionErrors } = useHandlePermissionErrors();

    useEffect(() => {
        fetchRoles(pagination.current, pagination.pageSize, { name: filteredTitle });
        fetchPermissions();
    }, [pagination.current, pagination.pageSize, filteredTitle]);


    const handleTableChange = (pagination: any, filters: any) => {
        const newFilters = filters.name ? { name: filters.name[0] } : {};
        fetchRoles(pagination.current, pagination.pageSize, newFilters);
    };

    /*|--------------------------------------------------------------------------
    |  Fetch roles
    |-------------------------------------------------------------------------- */
    const fetchRoles = async (page = 1, pageSize = 10, filters = {}) => {
        try {
            setIsLoading(true);
            const response = await roleService.getRoles(page, pageSize, filters);
            setRoles(response.roles);
            setPagination({
                current: page,
                pageSize: pageSize,
                total: response.pagination.total,
            });
        } catch (error) {
            await handlePermissionErrors(error);
            console.error('Error fetching roles:', error);
            openNotificationWithIcon('error', 'Erreur', 'Erreur lors du chargement des roles');
        } finally {
            setIsLoading(false);
        }
    };

    /*|--------------------------------------------------------------------------
    |  Fetch permissions
    |-------------------------------------------------------------------------- */
    const fetchPermissions = async () => {
        try {
            const response = await roleService.getPermissions();
            setPermissions(response.permissions);
        } catch (error) {
            console.error('Error fetching permissions:', error);
            openNotificationWithIcon('error', 'Erreur', 'Erreur lors du chargement des permissions');
        }
    };


    /*|--------------------------------------------------------------------------
    |  Table columns
    |-------------------------------------------------------------------------- */
    const columns:any = [
        {
            title: 'Titre',
            dataIndex: 'name',
            key: 'name',
            sorter: (a:any, b:any) => a.name.localeCompare(b.name),
            filterDropdown: (props:any) => (
                <CustomFilterDropdown
                    {...props}
                    placeholder="Rechercher titre"
                    handleFilter={handleTitleFilter}
                />
            ),
            onFilter: (value:any, record:any) => record.name.toLowerCase().includes(filteredTitle.toLowerCase()),
            filterIcon: (filtered:any) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
            filteredValue: filteredTitle ? [filteredTitle] : null,
        },
        {
            title: 'Permissions',
            key: 'permissions',
            render: (text:any, record:any) => (
                <div style={{ maxWidth: '1600px', display: 'flex', flexWrap: 'nowrap', gap: '4px', overflowX:"scroll",scrollbarWidth:'none', cursor:"grab" }}>
                    {record.permissions.length > 0 ? (
                        record.permissions.map((permission:any) => (
                            <Tag key={permission.id} color="blue" style={{ margin: '2px' }}>
                                {permission.name}
                            </Tag>
                        ))
                    ) : (
                        <Tag color="default">Aucune permission</Tag>
                    )}
                </div>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            align: 'right',
            render: (text:any, record:any) => (
                <div className="d-flex justify-content-end">
                    {
                        record.name === 'RH' || record.name === 'EMPLOYEE' || record.name === 'GUEST' ? (
                               <>
                                   <Button size="small" onClick={() => handleEdit(record)} disabled>
                                       Modifier
                                   </Button>
                                   <Button type="text" size="small" onClick={() => showDeleteConfirm(record.id)} style={{ marginLeft: 8 }} disabled>
                                       Supprimer
                                   </Button>
                               </>
                        ): (
                          <>
                              <Button size="small" onClick={() => handleEdit(record)}>
                                  Modifier
                              </Button>
                              <Button type="text" size="small" onClick={() => showDeleteConfirm(record.id)} style={{ marginLeft: 8 }}>
                                  Supprimer
                              </Button>

                          </>
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
    const showUpdateModal = () => setIsUpdateModalOpen(true);
    const showDeleteConfirm = (key:any) => {
        confirm({
            title: 'Êtes-vous sûr de supprimer cette role?',
            icon: <ExclamationCircleFilled />,
            okText: 'Supprimer',
            okType: 'danger',
            cancelText: 'Annuler',
            onOk() {
                handleDelete(key);
            },
            onCancel() {
                console.log('Annulation de la suppression');
            },
        });
    };

    const handleCancel = () => resetStates();


    /*|--------------------------------------------------------------------------
    |  Handle filter functionality
    |-------------------------------------------------------------------------- */
    const handleTitleFilter = (value: any) => {
        resetPagination();
        setFilteredTitle(value);
        fetchRoles(1, pagination.pageSize, { name: value });
    };
    const handleTitle = (e:any) => setTitle(e.target.value);
    const resetPagination = () => {
        setPagination(prev => ({
            ...prev,
            current: 1,
        }));
    };
    /*|--------------------------------------------------------------------------
    |  Handle store role
    |-------------------------------------------------------------------------- */
    const handleAddRole = async () => {
        try {
            const roleData = {
                name: title,
                permissions: selectedPermissions
            };
            await roleService.createRole(roleData);
            resetStates();
            openNotificationWithIcon('success', 'Succès', 'Rôle ajouté avec succès');
            await fetchRoles();
        } catch (error) {
            await handlePermissionErrors(error);
            handleError(error, setErrors);
        }
    };
    const handlePermissionsChange = (value:any) => {
        setSelectedPermissions(value);
    };


    /*|--------------------------------------------------------------------------
      |  Handle update role
      |-------------------------------------------------------------------------- */
    const handleEdit = (record:any) => {
        setCurrentRole(record);
        setTitle(record.name);
        setSelectedPermissions(record.permissions.map((permission:any) => permission.name));
        showUpdateModal()
    };

    const handleUpdateRole = async () => {
        try {
            const updatedRoleData = {
                name: title,
                permissions: selectedPermissions
            };
            await roleService.updateRole(currentRole.id, updatedRoleData);
            resetStates();
            openNotificationWithIcon('success', 'Succès', 'Rôle mis à jour avec succès');
            await fetchRoles();
        } catch (error) {
            await handlePermissionErrors(error);
            handleError(error, setErrors);
        }
    };


    /*|--------------------------------------------------------------------------
   |  Handle delete role
   |-------------------------------------------------------------------------- */
    const handleDelete = async (key:any) => {
        try {
            await roleService.deleteRole(key);
            openNotificationWithIcon('success', 'Succès', 'Role supprimée avec succès');
            await fetchRoles();
        } catch (error) {
            await handlePermissionErrors(error);
            openNotificationWithIcon('error', 'Erreur', 'Erreur lors de la suppression de la role');
        }
    };


    /*|--------------------------------------------------------------------------
     |  Reset States
     |-------------------------------------------------------------------------- */
    const resetStates = () => {
        setIsAddModalOpen(false);
        setIsUpdateModalOpen(false)
        setTitle('');
        setSelectedPermissions([])
        setErrors({});
    };


    return (
        <>
            <div>
                <h3 className="mb-4 bg-white p-4 ">Roles</h3>
                <div>
                    <div className="mb-2 d-flex justify-content-end">
                        <button className="btn bg-dark text-white" onClick={showAddModal}>
                            <IoMdAdd className="fs-4" /> Ajouter un role
                        </button>
                    </div>
                    <Table
                        columns={columns}
                        dataSource={roles}
                        rowKey="id"
                        loading={isLoading}
                        pagination={{
                            current: pagination.current,
                            pageSize: pagination.pageSize,
                            total: pagination.total,
                        }}
                        onChange={handleTableChange}
                        scroll={{ x: 'max-content' }}
                    />
                </div>
            </div>


            {/* ------- add role ------- */}
            <ManagementFormModal
                title="Ajouter un rôle"
                subTitle="Roles"
                open={isAddModalOpen}
                onClose={handleCancel}
                onSubmit={handleAddRole}
            >
                <CustomInput
                    I_class_container="mb-3"
                    type="text"
                    label="Entrer le titre du rôle"
                    value={title}
                    action={handleTitle}
                    error={errors.name}
                />
                <Select
                    mode="multiple"
                    style={{ width: '100%' }}
                    placeholder="Sélectionner les permissions"
                    onChange={handlePermissionsChange}
                    value={selectedPermissions}
                >
                    {permissions.map((permission:any) => (
                        <Option key={permission.id} value={permission.name}>
                            {permission.name}
                        </Option>
                    ))}
                </Select>
            </ManagementFormModal>


            {/* ------- update role ------- */}
            <ManagementFormModal
                title={currentRole ? "Modifier un rôle" : "Ajouter un rôle"}
                subTitle="Roles"
                open={isUpdateModalOpen}
                onClose={handleCancel}
                onSubmit={currentRole ? handleUpdateRole : handleAddRole}
            >
                <CustomInput
                    I_class_container="mb-3"
                    type="text"
                    label="Entrer le titre du rôle"
                    value={title}
                    action={handleTitle}
                    error={errors.name}
                />
                <Select
                    mode="multiple"
                    style={{ width: '100%' }}
                    placeholder="Sélectionner les permissions"
                    onChange={handlePermissionsChange}
                    value={selectedPermissions}
                >
                    {permissions.map((permission:any) => (
                        <Option key={permission.id} value={permission.name}>
                            {permission.name}
                        </Option>
                    ))}
                </Select>
            </ManagementFormModal>
        </>
    );
};

export default Roles;