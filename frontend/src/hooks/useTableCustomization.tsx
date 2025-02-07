import { useState } from "react";
import { Form, Modal, Input, Checkbox, Space, Button, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { ColumnType } from "antd/es/table";

interface ColumnDefinition {
  defaultTitle: string;
  key: string;
  dataIndex: string | string[];
  render?: (value: any, record: any) => React.ReactNode;
  [key: string]: any;
}

interface TableCustomization {
  title?: string;
  visible: boolean;
  sortable?: boolean;
  filterable?: boolean;
}

// Add type for the accumulator in reduce
type CustomizationAccumulator = {
  [key: string]: TableCustomization;
};

// Update the search type to match backend operators
type SearchType = 
  // Comparison operators
  | 'eq' 
  | 'ne' 
  | 'lt' 
  | 'lte' 
  | 'gt' 
  | 'gte'
  // Text search operators
  | 'contains'
  | 'ncontains'
  | 'startswith'
  | 'endswith'
  | 'nstartswith'
  | 'nendswith';

interface SearchConfig {
  text: string;
  type: SearchType;
}

export const useTableCustomization = (baseColumns: ColumnDefinition[]) => {
  const [columnCustomizations, setColumnCustomizations] = useState<Record<string, TableCustomization>>({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Update searchText state to include search type
  const [searchText, setSearchText] = useState<Record<string, SearchConfig>>({});
  const [searchedColumns, setSearchedColumns] = useState<string[]>([]);

  const handleSearch = (key: string, value: string, type: SearchType) => {
    console.log('=== handleSearch START ===');
    console.log('Input params:', { key, value, type });
    console.log('Current searchText:', searchText);
    
    setSearchText(prev => {
      const newState = { ...prev, [key]: { text: value, type } };
      console.log('New searchText state:', newState);
      return newState;
    });
    console.log('=== handleSearch END ===');
    setSearchedColumns(prev => 
      value ? [...new Set([...prev, key])] : prev.filter(k => k !== key)
    );
  };

  const handleReset = (key: string) => {
    console.log('=== handleReset START ===');
    
    // Clear the search text state
    setSearchText(prev => {
      const newState = { ...prev };
      delete newState[key]; // Remove the filter completely instead of setting empty values
      return newState;
    });
    
    // Remove from searched columns
    setSearchedColumns(prev => prev.filter(k => k !== key));
    
    // Create an empty filter value to trigger table update
    return [{
      field: '',
      operator: '',
      value: ''
    }];
  };

  // Update the filter dropdown to show appropriate operators based on column type
  const getOperatorOptions = (column: ColumnDefinition) => {
    // Determine if the column is numeric
    const isNumeric = column.dataIndex === 'id' || 
      typeof column.render === 'function' && column.render.toString().includes('number');

    if (isNumeric) {
      return [
        { label: 'Equals', value: 'eq' },
        { label: 'Not Equals', value: 'ne' },
        { label: 'Less Than', value: 'lt' },
        { label: 'Less Than or Equal', value: 'lte' },
        { label: 'Greater Than', value: 'gt' },
        { label: 'Greater Than or Equal', value: 'gte' },
      ];
    }

    return [
      { label: 'Contains', value: 'contains' },
      { label: 'Does Not Contain', value: 'ncontains' },
      { label: 'Starts With', value: 'startswith' },
      { label: 'Does Not Start With', value: 'nstartswith' },
      { label: 'Ends With', value: 'endswith' },
      { label: 'Does Not End With', value: 'nendswith' },
    ];
  };

  // Process columns with customizations
  const processedColumns = baseColumns.map(column => {
    const baseColumn = {
      ...column,
      title: columnCustomizations[column.key]?.title ?? column.defaultTitle,
      hidden: columnCustomizations[column.key]?.visible === false,
      sorter: columnCustomizations[column.key]?.sortable ? true : undefined,
    };

    // Add filter functionality if enabled
    if (columnCustomizations[column.key]?.filterable) {
      return {
        ...baseColumn,
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => {
          console.log('=== filterDropdown RENDER ===');
          console.log('Props:', { selectedKeys, searchText: searchText[column.key], columnKey: column.key });
          console.log('Filter Dropdown Rendered', { 
            selectedKeys,
            currentSearchText: searchText[column.key],
            columnKey: column.key 
          });

          const handleConfirm = () => {
            console.log('=== handleConfirm START ===');
            console.log('Current searchText:', searchText);
            console.log('Current column:', column);
            
            const filterValue = {
              field: column.dataIndex,
              operator: searchText[column.key]?.type || 'contains',
              value: searchText[column.key]?.text || ''
            };
            console.log('Created filterValue:', filterValue);
            console.log('Setting selectedKeys with:', [filterValue]);
            
            // Ensure we're setting the filter value directly
            setSelectedKeys([filterValue]);
            console.log('=== handleConfirm END ===');
            confirm();
          };

          return (
            <div style={{ padding: 8 }}>
              <Space direction="vertical">
                <Select
                  style={{ width: 200 }}
                  placeholder="Select Operator"
                  value={searchText[column.key]?.type || 'contains'}
                  onChange={(value: SearchType) => {
                    console.log('Operator Changed', { value, column: column.key });
                    const newSearchText = searchText[column.key]?.text || '';
                    handleSearch(column.key, newSearchText, value);
                  }}
                  options={getOperatorOptions(column)}
                />
                <Input
                  placeholder={`Search ${column.defaultTitle}`}
                  value={searchText[column.key]?.text}
                  onChange={e => {
                    const newValue = e.target.value;
                    console.log('Input Changed', { newValue, column: column.key });
                    handleSearch(column.key, newValue, searchText[column.key]?.type || 'contains');
                  }}
                  onPressEnter={handleConfirm}
                  style={{ width: 188, marginBottom: 8, display: 'block' }}
                />
                <Space>
                  <Button
                    type="primary"
                    onClick={handleConfirm}
                    icon={<SearchOutlined />}
                    size="small"
                    style={{ width: 90 }}
                  >
                    Search
                  </Button>
                  <Button
                    onClick={() => {
                      console.log('Reset Button Clicked');
                      const emptyFilter = handleReset(column.key);
                      setSelectedKeys(emptyFilter);
                      clearFilters?.();
                      confirm(); // Trigger the table update
                    }}
                    size="small"
                    style={{ width: 90 }}
                  >
                    Reset
                  </Button>
                </Space>
              </Space>
            </div>
          );
        },
        filterIcon: (filtered: boolean) => (
          <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
        ),
        filtered: searchedColumns.includes(column.key),
        filteredValue: searchedColumns.includes(column.key) 
          ? [{
              field: column.dataIndex,
              operator: searchText[column.key]?.type || 'contains',
              value: searchText[column.key]?.text || ''
            }]
          : null,
      } as ColumnType<any>;
    }

    return baseColumn;
  });

  const showCustomizeModal = () => {
    form.setFieldsValue(
      baseColumns.reduce((acc, column) => ({
        ...acc,
        [`${column.key}_title`]: columnCustomizations[column.key]?.title ?? column.defaultTitle,
        [`${column.key}_visible`]: columnCustomizations[column.key]?.visible ?? true,
        [`${column.key}_sortable`]: columnCustomizations[column.key]?.sortable ?? false,
        [`${column.key}_filterable`]: columnCustomizations[column.key]?.filterable ?? false,
      }), {})
    );
    setIsModalVisible(true);
  };

  const handleCustomizeOk = () => {
    form.validateFields().then((values) => {
      const newCustomizations = baseColumns.reduce((acc: CustomizationAccumulator, column) => {
        const customTitle = values[`${column.key}_title`];
        const visible = values[`${column.key}_visible`];
        const sortable = values[`${column.key}_sortable`];
        const filterable = values[`${column.key}_filterable`];
        const isDefault = customTitle === column.defaultTitle && 
                         visible === true && 
                         sortable === false &&
                         filterable === false;

        if (!isDefault) {
          acc[column.key] = {
            title: customTitle,
            visible,
            sortable,
            filterable,
          };
        }
        return acc;
      }, {});

      setColumnCustomizations(newCustomizations);
      setIsModalVisible(false);
    });
  };

  const renderCustomizeModal = () => (
    <Modal
      title="Customize Table"
      open={isModalVisible}
      onOk={handleCustomizeOk}
      onCancel={() => setIsModalVisible(false)}
      width={600}
    >
      <Form form={form} layout="vertical">
        {baseColumns.map((column) => (
          <div key={column.key} style={{ 
            display: 'flex', 
            gap: '16px', 
            alignItems: 'flex-start',
            marginBottom: '16px' 
          }}>
            <Form.Item 
              name={`${column.key}_title`} 
              label={`${column.defaultTitle} Column`}
              style={{ flex: 1, marginBottom: 0 }}
            >
              <Input />
            </Form.Item>
            <Space style={{ marginTop: '29px' }}>
              <Form.Item 
                name={`${column.key}_visible`} 
                valuePropName="checked"
                style={{ marginBottom: 0 }}
              >
                <Checkbox>Show</Checkbox>
              </Form.Item>
              <Form.Item 
                name={`${column.key}_sortable`} 
                valuePropName="checked"
                style={{ marginBottom: 0 }}
              >
                <Checkbox>Sort</Checkbox>
              </Form.Item>
              <Form.Item 
                name={`${column.key}_filterable`} 
                valuePropName="checked"
                style={{ marginBottom: 0 }}
              >
                <Checkbox>Filter</Checkbox>
              </Form.Item>
            </Space>
          </div>
        ))}
      </Form>
    </Modal>
  );

  return {
    processedColumns,
    showCustomizeModal,
    renderCustomizeModal,
  };
}; 