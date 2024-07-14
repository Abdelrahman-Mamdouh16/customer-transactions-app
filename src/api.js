// src/api.js
export const fetchData = async () => {
  try {
    const responseCustomers = await fetch("https://server-customer-transaction.vercel.app/customers");
    const customers = await responseCustomers.json();

    const responseTransactions = await fetch("https://server-customer-transaction.vercel.app/transactions")
    const transactions = await responseTransactions.json();
    console.log(customers, transactions);
    return { customers, transactions };
  } catch (error) {
    console.log(error);
  }

  ;

};
