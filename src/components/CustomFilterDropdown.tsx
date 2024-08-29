import { Input, Button } from 'antd';

/*|--------------------------------------------------------------------------
|  Drop down component for filter functionality
|-------------------------------------------------------------------------- */
const CustomFilterDropdown = ({ setSelectedKeys, selectedKeys, confirm, clearFilters, handleFilter, placeholder }) => (
    <div style={{ padding: 8 }}>
        <Input
            placeholder={placeholder}
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => {
                handleFilter(selectedKeys[0]);
                confirm();
            }}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Button
            type="dashed"
            onClick={() => {
                handleFilter(selectedKeys[0]);
                confirm();
            }}
            size="small"
            style={{ width: 90, marginRight: 8 }}
        >
            Filtrer
        </Button>
        <Button onClick={() => {
            handleFilter(null);
            clearFilters();
        }} size="small" style={{ width: 90 }}>
            Réinitialiser
        </Button>
    </div>
);


export default CustomFilterDropdown;
