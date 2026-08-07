import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { WEBSITE_NAME } from '@/constants';
import axios from 'axios';
import { useTranslation } from '@/Hooks/useTranslation';
import { withAuth } from "@/Hoc/withAuth";
import { API_BASE_URL } from '@/constants';
import styles from "@/Components/Categories/Categories.module.scss";
import LayoutApp from '@/Components/Layout/LayoutApp';
import Categories from "@/Components/Categories/Categories";
import CategoriesForm from "@/Components/Categories/CategoriesForm";
import Loading from "@/Components/UI/Loading";
import AppPageHeader from '@/Components/Layout/AppPageHeader';

function CategoriesPage() {
    const [categories, setCategories] = useState(null);
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation();
    useEffect(() => {
        const token = localStorage.getItem('token');
        axios
            .get(`${API_BASE_URL}/getCategories`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            })
            .then((response) => {
                setCategories(response.data.categories);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                setLoading(false);
            });
    }, []);

    const addCategory = (newCategory) => {
        setCategories([...categories, newCategory]);
    };

    return (
        <LayoutApp>
            <Head>
                <title>{`Categories | ${WEBSITE_NAME}`}</title>
            </Head>
            <AppPageHeader eyebrow="Organization" title={t('Categories')} description={t('Organize your expenses with categories.')} actionHref="/categories/create" actionLabel={t('Add Category')} />
            {/*<div className={styles.categoriesForm}>*/}
            {/*    <CategoriesForm addCategory={addCategory}/>*/}
            {/*</div>*/}
            {loading ? (
                <Loading />
            ) : categories && (
                <Categories categories={categories} />
            )}
        </LayoutApp>
    );
}

export default withAuth(CategoriesPage);
