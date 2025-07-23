<script>
    import { Meta, Story, Template } from '@storybook/addon-svelte-csf';
    import DatabaseCredentialsForm from './DatabaseCredentialsForm.svelte';

    /** @typedef {{
        host: string,
        port: string,
        database: string,
        username: string,
        password: string
    }} FormData */

    const meta = {
        title: 'Forms/DatabaseCredentialsForm',
        component: DatabaseCredentialsForm,
        parameters: {
            docs: {
                description: {
                    component: 'A form component for collecting database connection credentials. Includes fields for host, port, database name, username, and password.'
                }
            }
        }
    };

    /** @param {FormData} data */
    function handleSubmit(data) {
        console.log('Form submitted with data:', data);
    }
</script>

<Meta {...meta} />

<Template let:args>
    <DatabaseCredentialsForm {...args} onSubmit={handleSubmit} />
</Template>

<Story 
    name="Default"
    args={{}}
/>

<Story 
    name="With Prefilled Values"
    args={{
        formData: {
            host: 'localhost',
            port: '5432',
            database: 'example_db',
            username: 'admin',
            password: ''
        }
    }}
/>

<Story 
    name="PostgreSQL Example"
    args={{
        formData: {
            host: 'postgres.example.com',
            port: '5432',
            database: 'production_db',
            username: 'postgres',
            password: ''
        }
    }}
/>

<Story 
    name="MySQL Example"
    args={{
        formData: {
            host: 'mysql.example.com',
            port: '3306',
            database: 'mysql_db',
            username: 'root',
            password: ''
        }
    }}
/> 