import { GitHubBanner, Refine, DataProvider } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import simpleRestDataProvider from "@refinedev/simple-rest";
import {
  ErrorComponent,
  ThemedLayoutV2,
  ThemedSiderV2,
  useNotificationProvider,
} from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";

import routerBindings, {
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router";
import { App as AntdApp } from "antd";
import { BrowserRouter, Outlet, Route, Routes } from "react-router";
import { Header } from "./components/header";
import { ColorModeContextProvider } from "./contexts/color-mode";
import {
  BlogPostCreate,
  BlogPostEdit,
  BlogPostList,
  BlogPostShow,
} from "./pages/blog-posts";
import {
  CategoryCreate,
  CategoryEdit,
  CategoryList,
  CategoryShow,
} from "./pages/categories";
import { BlogPostSQLList } from "./pages/blog-post-sql/list";

const API_URL = "http://localhost:8000";

// Create base data provider instance
const baseDataProvider = simpleRestDataProvider(API_URL);

// Extend with custom functionality
const customDataProvider: DataProvider = {
  ...baseDataProvider,
  getList: async ({ resource, pagination, sorters, filters }) => {
    console.log('=== getList START ===');
    console.log('Input params:', { resource, pagination, sorters, filters });
    
    try {
      const { current = 1, pageSize = 10 } = pagination ?? {};
      
      // Build base URL
      let url = `${API_URL}/${resource}/?`;
      
      // Add pagination parameters
      const params = [
        `_page=${current}`,
        `_limit=${pageSize}`
      ];

      // Add sort parameters
      if (sorters && sorters.length > 0) {
        params.push(`_sort=${sorters[0].field}`);
        params.push(`_order=${sorters[0].order}`);
      }

      // Add filter parameters without URL encoding the brackets
      if (filters && filters.length > 0) {
        console.log('Processing filters in data provider:', filters);
        filters.forEach((filter) => {
          console.log('Processing individual filter:', filter);
          
          // Extract the actual filter value from the array if needed
          let actualFilter = filter;
          if (Array.isArray(filter.value) && filter.value.length > 0) {
            actualFilter = filter.value[0];
          }
          
          console.log('Actual filter:', actualFilter);
          
          params.push(`filter[field]=${actualFilter.field}`);
          params.push(`filter[operator]=${actualFilter.operator || 'contains'}`);
          params.push(`filter[value]=${actualFilter.value}`);
        });
      }

      url += params.join('&');
      console.log('Final URL:', url);

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Handle error responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        
        // Return empty data instead of throwing
        return {
          data: [],
          total: 0
        };
      }

      const data = await response.json();
      const total = response.headers.get('x-total-count') 
        ? parseInt(response.headers.get('x-total-count') || '0', 10)
        : 0;

      console.log('Response Received:', { data, total });

      return {
        data,
        total,
      };
    } catch (error) {
      // Log the error but return empty data
      console.error('Error in getList:', error);
      return {
        data: [],
        total: 0
      };
    }
  },
};

// Create data providers object with named providers
const dataProviders = {
  default: simpleRestDataProvider("https://api.fake-rest.refine.dev"),
  sql: customDataProvider,
};

function App() {
  return (
    <BrowserRouter>
      <GitHubBanner />
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <AntdApp>
            <DevtoolsProvider>
              <Refine
                dataProvider={dataProviders}
                notificationProvider={useNotificationProvider}
                routerProvider={routerBindings}
                resources={[
                  {
                    name: "blog_posts",
                    list: "/blog-posts",
                    create: "/blog-posts/create",
                    edit: "/blog-posts/edit/:id",
                    show: "/blog-posts/show/:id",
                    meta: {
                      canDelete: true,
                      dataProviderName: "default",
                    },
                  },
                  {
                    name: "categories",
                    list: "/categories",
                    create: "/categories/create",
                    edit: "/categories/edit/:id",
                    show: "/categories/show/:id",
                    meta: {
                      canDelete: true,
                      dataProviderName: "default",
                    },
                  },
                  {
                    name: "blog-post-sql",
                    list: "/blog-post-sql",
                    meta: {
                      canDelete: false,
                      dataProviderName: "sql",
                      label: "Blog Post SQL",
                    },
                  },
                ]}
                options={{
                  syncWithLocation: true,
                  warnWhenUnsavedChanges: true,
                  useNewQueryKeys: true,
                  projectId: "HoFcqa-ADDR4h-CmlfIz",
                }}
              >
                <Routes>
                  <Route
                    element={
                      <ThemedLayoutV2
                        Header={() => <Header sticky />}
                        Sider={(props) => <ThemedSiderV2 {...props} fixed />}
                      >
                        <Outlet />
                      </ThemedLayoutV2>
                    }
                  >
                    <Route
                      index
                      element={<NavigateToResource resource="blog_posts" />}
                    />
                    <Route path="/blog-posts">
                      <Route index element={<BlogPostList />} />
                      <Route path="create" element={<BlogPostCreate />} />
                      <Route path="edit/:id" element={<BlogPostEdit />} />
                      <Route path="show/:id" element={<BlogPostShow />} />
                    </Route>
                    <Route path="/categories">
                      <Route index element={<CategoryList />} />
                      <Route path="create" element={<CategoryCreate />} />
                      <Route path="edit/:id" element={<CategoryEdit />} />
                      <Route path="show/:id" element={<CategoryShow />} />
                    </Route>
                    <Route path="/blog-post-sql">
                      <Route index element={<BlogPostSQLList />} />
                    </Route>
                    <Route path="*" element={<ErrorComponent />} />
                  </Route>
                </Routes>

                <RefineKbar />
                <UnsavedChangesNotifier />
                <DocumentTitleHandler />
              </Refine>
              <DevtoolsPanel />
            </DevtoolsProvider>
          </AntdApp>
        </ColorModeContextProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
