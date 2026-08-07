import React from "react";
import Head from 'next/head';
import { WEBSITE_NAME } from '@/constants';
import { useTranslation } from '@/Hooks/useTranslation';
import { withAuth } from "@/Hoc/withAuth";
import styles from "@/Components/Categories/Categories.module.scss";
import LayoutApp from '@/Components/Layout/LayoutApp';
import AppPageHeader from '@/Components/Layout/AppPageHeader';
import CategoriesForm from "@/Components/Categories/CategoriesForm";

function CategoriesCreatePage() {
    const { t } = useTranslation();

    return (
        <LayoutApp>
            <Head>
                <title>{`New Category | ${WEBSITE_NAME}`}</title>
            </Head>
            <AppPageHeader eyebrow="New category" title={t('Create Category')} description="Organize your transactions with a category." />
            <div className={styles.categoryForm}>
                <CategoriesForm />
            </div>
        </LayoutApp>
    );
}

export default withAuth(CategoriesCreatePage);
