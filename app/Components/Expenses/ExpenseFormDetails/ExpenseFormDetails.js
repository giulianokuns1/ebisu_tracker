import React, {useEffect, useState} from 'react';
import styles from "@/Components/Expenses/ExpenseFormDetails/ExpenseFormDetails.module.scss";
import ExpenseForm from "@/Components/Expenses/ExpensesForm";
import axios from "axios";
import {API_BASE_URL} from "@/constants";
import ExpensePaymentsList from './ExpensePaymentsList';

const ExpenseFormDetails = ({ expenseId }) => {
    const [expenseData, setExpenseData] = useState(null);
    const [newExpenseData, setNewExpenseData] = useState(null);

    const fetchExpense = () => {
        if (!expenseId) return;
        const token = localStorage.getItem('token');
        axios
            .get(`${API_BASE_URL}/getExpense?expenseId=` + expenseId, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((response) => {
                if (response.data && response.data.expense) {
                    setExpenseData(response.data);
                }
            })
            .catch((error) => console.error('Error fetching data:', error));
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (expenseId) {
            fetchExpense();
        } else {
            axios
                .get(`${API_BASE_URL}/newExpenseData`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                .then((response) => setNewExpenseData(response.data))
                .catch((error) => console.error('Error fetching data:', error));
        }
    }, [expenseId]);

    return (
        <div>
            {(expenseData || newExpenseData) && (
                <div>
                    <div className={`${styles.container} ${expenseId ? styles.editContainer : styles.createContainer}`}>
                        <ExpenseForm
                            expenseId={expenseId}
                            expenseData={expenseData}
                            newExpenseData={newExpenseData}
                        />
                        {expenseData && <ExpensePaymentsList payments={expenseData.payments || []} />}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpenseFormDetails;
