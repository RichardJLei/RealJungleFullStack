import { useTable } from "@refinedev/antd";
import { List, Table } from "antd";
import { useForm } from "@refinedev/antd";

export const BlogPostSQLList = () => {
  const { tableProps } = useTable({
    resource: "blog-post-sql",
    syncWithLocation: true,
  });

  const { formProps } = useForm();

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title="ID" />
        <Table.Column dataIndex="title" title="Title" />
        <Table.Column dataIndex="content" title="Content" />
        <Table.Column dataIndex="created_at" title="Created At" />
      </Table>
    </List>
  );
}; 