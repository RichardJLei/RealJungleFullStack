import React from "react";
import { useTable } from "@refinedev/antd";
import { Table, Button } from "antd";
import { List, DateField } from "@refinedev/antd";
import { useTableCustomization } from "../../hooks/useTableCustomization";

export const BlogPostSQLList = () => {
  const { tableProps } = useTable({
    resource: "blog-post-sql",
    syncWithLocation: true,
    pagination: {
      pageSize: 10,
    },
  });

  const baseColumns = [
    {
      defaultTitle: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      defaultTitle: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      defaultTitle: "Content",
      dataIndex: "content",
      key: "content",
    },
    {
      defaultTitle: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      render: (value: string) => <DateField value={value} />,
    },
  ];

  const { processedColumns, showCustomizeModal, renderCustomizeModal } = 
    useTableCustomization(baseColumns);

  return (
    <List
      headerButtons={({ defaultButtons }) => [
        ...(defaultButtons || []),
        <Button
          key="customize"
          onClick={showCustomizeModal}
          type="primary"
        >
          Customize Table
        </Button>
      ]}
    >
      <Table
        {...tableProps}
        rowKey="id"
        pagination={{
          ...tableProps.pagination,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} items`,
          pageSizeOptions: ["10", "20", "50", "100"],
          showQuickJumper: true,
        }}
      >
        {processedColumns
          .filter(column => !column.hidden)
          .map(({ hidden, defaultTitle, key, ...columnProps }) => (
            <Table.Column key={key} {...columnProps} />
          ))}
      </Table>
      {renderCustomizeModal()}
    </List>
  );
}; 