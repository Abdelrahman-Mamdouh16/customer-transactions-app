import React, { useState, useEffect, useRef } from 'react';
import { fetchData } from './api';
import 'tailwindcss/tailwind.css';
import Chart from 'chart.js/auto';
import { CategoryScale, BarController, BarElement } from 'chart.js';

Chart.register(CategoryScale, BarController, BarElement);

function App() {
  const [customers, setCustomers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [filterAmount, setFilterAmount] = useState('');
  const chartContainerRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    const getData = async () => {
      const data = await fetchData();
      if (data) {
        setCustomers(data.customers);
        setTransactions(data.transactions);
        setFilteredTransactions(data.transactions);
      }
    };
    getData();
  }, []);

  const handleFilterCustomerID = (customerId) => {
    if (customerId === "") {
      // When "All" is selected, show data for all customers
      setSelectedCustomer(null); // Reset selectedCustomer to null
      setFilteredTransactions(transactions);
    } else {
      // Filter transactions for the selected customer
      const filtered = transactions.filter(transaction => transaction.customer_id === parseInt(customerId));
      setFilteredTransactions(filtered);
      setSelectedCustomer(customers.find(customer => customer.id === parseInt(customerId)));
    }
  };

  const handleFilterAmount = (amount) => {
    const filtered = transactions.filter(transaction => transaction.amount >= parseInt(amount));
    setFilteredTransactions(filtered);
    setFilterAmount(amount);
  };

  const chartData = () => {
    if (!selectedCustomer) {
      // Show chart for all customers
      const allCustomerTransactions = transactions.reduce((acc, transaction) => {
        const existingCustomer = acc.find(item => item.customer_id === transaction.customer_id);
        if (existingCustomer) {
          existingCustomer.amount += transaction.amount;
        } else {
          acc.push({ customer_id: transaction.customer_id, amount: transaction.amount });
        }
        return acc;
      }, []);

      const customerNames = customers.reduce((acc, customer) => {
        acc[customer.id] = customer.name;
        return acc;
      }, {});

      const labels = Object.keys(customerNames).map(customerId => customerNames[customerId]);
      const amounts = Object.values(allCustomerTransactions).map(transaction => transaction.amount);

      return {
        labels: labels,
        datasets: [{
          label: 'Total amount per customer',
          data: amounts,
          backgroundColor: 'rgb(75, 192, 192)',
          borderColor: 'rgb(75, 192, 192)',
          borderWidth: 1
        }]
      };
    } else {
      // Show chart for selected customer
      const customerTransactions = transactions.filter(transaction => transaction.customer_id === selectedCustomer.id);
      const dates = [...new Set(customerTransactions.map(transaction => transaction.date))];
      const amounts = dates.map(date => {
        return customerTransactions.filter(transaction => transaction.date === date).reduce((sum, transaction) => sum + transaction.amount, 0);
      });

      return {
        labels: dates,
        datasets: [{
          label: `Total amount per day for ${selectedCustomer.name}`,
          data: amounts,
          backgroundColor: 'rgb(75, 192, 192)',
          borderColor: 'rgb(75, 192, 192)',
          borderWidth: 1
        }]
      };
    }
  };

  useEffect(() => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    if (chartContainerRef.current && chartData().datasets.length > 0) {
      chartInstanceRef.current = new Chart(chartContainerRef.current, {
        type: 'bar',
        data: chartData(),
        options: {
          responsive: true,
          scales: {
            x: {
              stacked: true,
            },
            y: {
              stacked: true
            }
          }
        },
      });
    }
  }, [selectedCustomer, transactions]); // Include transactions dependency to update chart on page reload

  return (
    <div className="container mx-auto p-4 bg-green-800 min-h-[100vh]">
      <div className='lg:w-2/3 m-auto'>
        <h1 className="text-3xl font-bold mb-6 text-center text-white">Customer Transactions Task</h1>
        <div className="mt-4 p-4 shadow rounded-lg bg-green-600 text-white mb-5">
          <label className="block mb-2 text-lg text-center">Select customer to show the charts:</label>
          <select
            className="block w-full p-2 border border-gray-300 rounded text-black"
            value={selectedCustomer ? selectedCustomer.id : ""}
            onChange={(e) => handleFilterCustomerID(e.target.value)}
          >
            <option value="">All</option>
            {customers.map(customer => (
              <option key={customer.id} value={customer.id}>{customer.name}</option>
            ))}
          </select>
        </div>
        <div className="mt-4 p-4 bg-white shadow rounded-lg mb-5 m-auto">
          <canvas ref={chartContainerRef}></canvas>
        </div>
        <div className="mb-4 p-4 bg-green-600 text-white shadow rounded-lg flex">
          <div className='w-1/2 p-4'>
            <label className="block mb-2 text-lg">Filter by customer:</label>
            <select
              className="block w-full p-2 border border-gray-300 rounded mb-4 text-black"
              onChange={(e) => handleFilterCustomerID(e.target.value)}
            >
              <option value="">All</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>{customer.name}</option>
              ))}
            </select>
          </div>
          <div className='w-1/2 p-4'>
            <label className="block mb-2 text-lg">Filter by amount:</label>
            <input
              type="number"
              className="block w-full p-2 border border-gray-300 rounded mb-4 text-black"
              value={filterAmount}
              onChange={(e) => handleFilterAmount(e.target.value)}
            />
          </div>
        </div>
        <table className="min-w-full bg-white shadow rounded-xl overflow-hidden">
          <thead>
            <tr className="bg-green-600 text-white">
              <th className="py-2 px-4 border-b">Customer</th>
              <th className="py-2 px-4 border-b">Date</th>
              <th className="py-2 px-4 border-b">Amount</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map(transaction => (
              <tr key={transaction.id} className="hover:bg-gray-100 text-center">
                <td className="py-2 px-4 border-b">{customers.find(customer => customer.id === transaction.customer_id)?.name}</td>
                <td className="py-2 px-4 border-b">{transaction.date}</td>
                <td className="py-2 px-4 border-b">{transaction.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
