import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { connect } from "react-redux";
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBCardHeader, 
  MDBBtn,
  MDBInput,
  MDBDropdown,
  MDBDropdownToggle,
  MDBDropdownMenu,
  MDBDropdownItem,
  MDBTable,
  MDBTableHead,
  MDBTableBody,
} from 'mdb-react-ui-kit';
import { FaCalendarAlt, FaFileExport, FaEye, FaUsers, FaProjectDiagram, FaFolderOpen } from 'react-icons/fa';
import { BsGraphUpArrow } from 'react-icons/bs';
import { FiMap } from 'react-icons/fi';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import './dashboard.scss';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const mapStateToProps = (state) => ({
  ...state,
});

const mapDispatchToProps = () => ({});

const summaryCards = [
  { title: 'Total Revenue', baseValue: 487250, valueType: 'currency', notePrefix: {'className':'green','content':'▲ +18.4% '}, noteBase:{'className':'mute','content':'vs previous period'}, noteSuffix: {'className':'','content':''}, noteType: '', icon: <svg width="23" height="24" viewBox="0 0 23 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M23 19C23 20.654 21.654 22 20 22V23C20 23.552 19.553 24 19 24C18.447 24 18 23.552 18 23V22H17.732C16.665 22 15.669 21.426 15.134 20.501C14.857 20.023 15.021 19.412 15.498 19.135C15.978 18.857 16.589 19.022 16.864 19.5C17.043 19.808 17.375 20 17.731 20H19.999C20.551 20 20.999 19.552 20.999 19C20.999 18.622 20.728 18.302 20.355 18.24L17.314 17.733C15.972 17.51 14.999 16.36 14.999 15C14.999 13.346 16.345 12 17.999 12V11C17.999 10.448 18.446 10 18.999 10C19.552 10 19.999 10.448 19.999 11V12H20.267C21.334 12 22.33 12.574 22.865 13.499C23.142 13.977 22.978 14.588 22.501 14.865C22.02 15.141 21.41 14.977 21.135 14.5C20.956 14.192 20.624 14 20.268 14H18C17.448 14 17 14.448 17 15C17 15.378 17.271 15.698 17.644 15.76L20.685 16.267C22.027 16.49 23 17.64 23 19ZM6 9C5.448 9 5 9.448 5 10V23C5 23.552 5.448 24 6 24C6.552 24 7 23.552 7 23V10C7 9.448 6.552 9 6 9ZM1 12C0.448 12 0 12.448 0 13V23C0 23.552 0.448 24 1 24C1.552 24 2 23.552 2 23V13C2 12.448 1.552 12 1 12ZM11 6C10.448 6 10 6.448 10 7V23C10 23.552 10.448 24 11 24C11.552 24 12 23.552 12 23V7C12 6.448 11.552 6 11 6ZM21 8C21.553 8 22 7.552 22 7V1C22 0.448 21.553 0 21 0C20.447 0 20 0.448 20 1V7C20 7.552 20.447 8 21 8ZM16 9C16.553 9 17 8.552 17 8V4C17 3.448 16.553 3 16 3C15.447 3 15 3.448 15 4V8C15 8.552 15.447 9 16 9Z" fill="#04161F"/></svg>},
  { title: 'Leads Generated', baseValue: 1284, valueType: 'count',notePrefix: {'className':'mute','content':'Avg '}, noteBase:{'className':'green','content':'42/day'}, noteSuffix: {'className':'','content':''},noteType: '', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_24_414)"><path d="M22.3845 6.91132C22.2136 6.58597 21.8818 6.38389 21.5183 6.38389H18.7307C18.498 5.05646 17.3525 4.04502 15.9778 4.04502C14.603 4.04502 13.4575 5.05646 13.2248 6.38389H10.4006C10.6221 6.04012 10.7515 5.62998 10.7515 5.18957C10.7515 3.98222 9.78296 3 8.59245 3C7.40194 3 6.43341 3.98222 6.43341 5.18957C6.43341 5.62998 6.56276 6.04012 6.78426 6.38389H4.48165C4.11819 6.38389 3.78634 6.58597 3.61548 6.91132C3.44467 7.23663 3.4645 7.62871 3.6673 7.93455L10.2522 17.8651V23.5024C10.2522 23.6702 10.3355 23.8267 10.4739 23.9186C10.5551 23.9725 10.6487 24 10.7429 24C10.8093 24 10.876 23.9863 10.9388 23.9586L15.4531 21.9649C15.6321 21.8859 15.7479 21.7067 15.7479 21.5087V17.865L22.3327 7.9345C22.5355 7.62871 22.5554 7.23663 22.3845 6.91132ZM15.9778 5.04028C16.8088 5.04028 17.5107 5.60972 17.7254 6.38389H14.2302C14.4448 5.60972 15.1467 5.04028 15.9778 5.04028ZM8.5925 3.99526C9.24183 3.99526 9.77015 4.53106 9.77015 5.18957C9.77015 5.84809 9.24183 6.38389 8.5925 6.38389C7.94317 6.38389 7.41484 5.84809 7.41484 5.18957C7.41484 4.53106 7.94317 3.99526 8.5925 3.99526ZM14.85 17.4356C14.7955 17.5176 14.7664 17.6143 14.7664 17.7132V21.1827L11.2335 22.7429V18.2109H13.0062C13.2772 18.2109 13.4969 17.9881 13.4969 17.7132C13.4969 17.4384 13.2772 17.2156 13.0062 17.2156H11.0041L6.06569 9.76777H15.9778C16.2488 9.76777 16.4685 9.54498 16.4685 9.27014C16.4685 8.9953 16.2488 8.77251 15.9778 8.77251H5.40576L4.48184 7.37915H21.5183L14.85 17.4356Z" fill="#04161F" stroke="#04161F" stroke-width="0.5"/><path d="M15 -0.000488281C14.1729 -0.000488281 13.5 0.672398 13.5 1.49951C13.5 2.32663 14.1729 2.99951 15 2.99951C15.8271 2.99951 16.5 2.32663 16.5 1.49951C16.5 0.672398 15.8271 -0.000488281 15 -0.000488281ZM15 2.31769C14.5489 2.31769 14.1818 1.95064 14.1818 1.49951C14.1818 1.04839 14.5489 0.68133 15 0.68133C15.4511 0.68133 15.8182 1.04839 15.8182 1.49951C15.8182 1.95064 15.4511 2.31769 15 2.31769Z" fill="#04161F" stroke="#04161F" stroke-width="0.5"/><path d="M20 2C19.7238 2 19.5 2.23307 19.5 2.5206V5.47935C19.5 5.76693 19.7238 6 20 6C20.2761 6 20.5 5.76693 20.5 5.4794V2.5206C20.5 2.23307 20.2761 2 20 2Z" fill="#04161F" stroke="#04161F" stroke-width="0.5"/><path d="M20.3535 0.1465C20.2605 0.0535 20.1315 0 20 0C19.8685 0 19.7395 0.0535 19.6465 0.1465C19.5535 0.2395 19.5 0.3685 19.5 0.5C19.5 0.6315 19.5535 0.7605 19.6465 0.8535C19.7395 0.9465 19.8685 1 20 1C20.1315 1 20.2605 0.9465 20.3535 0.8535C20.4465 0.7605 20.5 0.6315 20.5 0.5C20.5 0.3685 20.4465 0.2395 20.3535 0.1465Z" fill="#04161F" stroke="#04161F" stroke-width="0.5"/><path d="M9.5 0C9.5 0 9.5 0.146787 9.5 0.327869V1.67213C9.5 1.85321 9.5 2 9.5 2C9.5 2 9.5 1.85321 9.5 1.67213V0.327869C9.5 0.146787 9.5 0 9.5 0Z" fill="#04161F" stroke="#04161F" stroke-width="0.5"/><path d="M3 1C2.72385 1 2.5 1.1577 2.5 1.35224V3.64775C2.5 3.8423 2.72385 4 3 4C3.27615 4 3.5 3.8423 3.5 3.64775V1.35224C3.5 1.1577 3.27615 1 3 1Z" fill="#04161F" stroke="#04161F" stroke-width="0.5"/><path d="M3.3535 5.1465C3.2605 5.053 3.1315 5 3 5C2.8685 5 2.7395 5.053 2.6465 5.1465C2.5535 5.2395 2.5 5.368 2.5 5.5C2.5 5.6315 2.5535 5.7605 2.6465 5.8535C2.7395 5.9465 2.8685 6 3 6C3.1315 6 3.2605 5.9465 3.3535 5.8535C3.4465 5.7605 3.5 5.6315 3.5 5.5C3.5 5.368 3.4465 5.2395 3.3535 5.1465Z" fill="#04161F" stroke="#04161F" stroke-width="0.5"/><path d="M18.3535 9.14608C18.2605 9.05304 18.1315 8.99951 18 8.99951C17.868 8.99951 17.739 9.05304 17.6465 9.14608C17.553 9.23913 17.5 9.36819 17.5 9.49976C17.5 9.63132 17.553 9.76038 17.6465 9.85343C17.7395 9.94647 17.868 10 18 10C18.1315 10 18.26 9.94647 18.3535 9.85343C18.4465 9.76038 18.5 9.63132 18.5 9.49976C18.5 9.36819 18.4465 9.23913 18.3535 9.14608Z" fill="#04161F" stroke="#04161F" stroke-width="0.5"/></g><defs><clipPath id="clip0_24_414"><rect width="25" height="25" fill="white" transform="translate(-0.499996 -0.5)"/></clipPath></defs></svg> },
  { title: 'Project Conversion', baseValue: 26.7, valueType: 'percent',notePrefix: {'className':'mute','content':'Industry avg: '}, noteBase:{'className':'green','content':'18%'}, noteSuffix: {'className':'','content':''}, noteType: '', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 3.99951C4.105 3.99951 5 3.10451 5 1.99951C5 0.894512 4.105 -0.000488281 3 -0.000488281C1.895 -0.000488281 1 0.894512 1 1.99951C1 3.10451 1.895 3.99951 3 3.99951ZM10 3.99951C11.105 3.99951 12 3.10451 12 1.99951C12 0.894512 11.105 -0.000488281 10 -0.000488281C8.895 -0.000488281 8 0.894512 8 1.99951C8 3.10451 8.895 3.99951 10 3.99951ZM17 3.99951C18.105 3.99951 19 3.10451 19 1.99951C19 0.894512 18.105 -0.000488281 17 -0.000488281C15.895 -0.000488281 15 0.894512 15 1.99951C15 3.10451 15.895 3.99951 17 3.99951ZM20 8.15451C20 6.56851 18.837 5.14251 17.257 5.01051C15.842 4.89251 14.624 5.76151 14.184 6.99951H12.817C12.404 5.83651 11.305 4.99951 10.001 4.99951C8.697 4.99951 7.598 5.83651 7.185 6.99951H5.818C5.378 5.76151 4.16 4.89251 2.745 5.01051C1.163 5.14251 0 6.56851 0 8.15451V9.05751C0 10.2725 0.552 11.4225 1.501 12.1815L7 16.5795V20.6455C7 21.5215 7.495 22.3215 8.278 22.7135L10.481 23.8145C10.729 23.9385 10.995 24.0005 11.26 24.0005C11.577 24.0005 11.893 23.9125 12.175 23.7375C12.692 23.4185 13 22.8645 13 22.2575V16.5795L14.625 15.2805C15.057 14.9345 15.126 14.3055 14.781 13.8745C14.436 13.4445 13.806 13.3725 13.376 13.7185L11.376 15.3185C11.139 15.5085 11.001 15.7955 11.001 16.0995V21.8385L9.173 20.9245C9.067 20.8715 9.001 20.7635 9.001 20.6455V16.0985C9.001 15.7945 8.863 15.5075 8.626 15.3175L2.752 10.6185C2.275 10.2375 2.002 9.66851 2.002 9.05751V8.99851H19.157C19.624 8.99851 20.002 8.62051 20.002 8.15351L20 8.15451ZM21.685 16.2665L18.644 15.7605C18.271 15.6985 18 15.3785 18 14.9995C18 14.4475 18.449 13.9995 19 13.9995H21.268C21.624 13.9995 21.956 14.1905 22.135 14.5005C22.412 14.9795 23.025 15.1445 23.501 14.8645C23.98 14.5885 24.143 13.9765 23.866 13.4985C23.331 12.5735 22.335 11.9995 21.268 11.9995H21V10.9995C21 10.4475 20.552 9.99951 20 9.99951C19.448 9.99951 19 10.4475 19 10.9995V11.9995C17.346 11.9995 16 13.3455 16 14.9995C16 16.3585 16.974 17.5095 18.315 17.7325L21.356 18.2385C21.729 18.3005 22 18.6205 22 18.9995C22 19.5515 21.551 19.9995 21 19.9995H18.732C18.376 19.9995 18.044 19.8085 17.865 19.4985C17.588 19.0205 16.975 18.8555 16.499 19.1345C16.02 19.4105 15.857 20.0225 16.134 20.5005C16.669 21.4255 17.665 21.9995 18.732 21.9995H19V22.9995C19 23.5515 19.448 23.9995 20 23.9995C20.552 23.9995 21 23.5515 21 22.9995V21.9995C22.654 21.9995 24 20.6535 24 18.9995C24 17.6405 23.026 16.4895 21.685 16.2665Z" fill="black"/></svg>},
  { title: 'Active Projects', baseValue: 64, valueType: 'count',notePrefix: {'className':'green','content':'12 '}, noteBase:{'className':'mute','content':'completed this month'}, noteSuffix: {'className':'','content':''}, noteType: '', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 0H5C2.243 0 0 2.243 0 5V19C0 21.757 2.243 24 5 24H19C21.757 24 24 21.757 24 19V5C24 2.243 21.757 0 19 0ZM22 19C22 20.654 20.654 22 19 22H5C3.346 22 2 20.654 2 19V5C2 4.648 2.072 4.314 2.184 4H21.816C21.928 4.314 22 4.648 22 5V19ZM4 8C4 7.448 4.447 7 5 7H8C8.553 7 9 7.448 9 8C9 8.552 8.553 9 8 9H5C4.447 9 4 8.552 4 8ZM14 13C14 13.553 13.553 14 13 14H7C6.447 14 6 13.553 6 13C6 12.447 6.447 12 7 12H13C13.553 12 14 12.448 14 13ZM14 18C14 18.553 13.553 19 13 19H5C4.447 19 4 18.553 4 18C4 17.447 4.447 17 5 17H13C13.553 17 14 17.447 14 18ZM20 18C20 19.105 19.105 20 18 20C16.895 20 16 19.105 16 18C16 17.262 16.405 16.624 17 16.277V10C17 9.449 16.552 9 16 9H14.723C14.377 9.595 13.739 10 13 10C11.895 10 11 9.105 11 8C11 6.895 11.895 6 13 6C13.738 6 14.376 6.405 14.723 7H16C17.654 7 19 8.346 19 10V16.277C19.595 16.623 20 17.261 20 18Z" fill="black"/></svg>},
];

const leadsByMonth = {
  labels: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    {
      data: [160, 220, 310, 420, 390, 450, 480, 520, 560],
      backgroundColor: '#2ca8e2',
      borderRadius: 10,
      barThickness: 8,
      borderSkipped: false,
    },
  ],
};

const leadsByMonthOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: true },
  },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#9aa1ab' } },
    y: {
      beginAtZero: true,
      max: 700,
      ticks: { color: '#c1c6ce', stepSize: 100 },
      grid: { color: '#edf0f4' },
    },
  },
};

const funnelData = [
  { label: 'Leads Captured', value: 1320 },
  { label: 'Qualified Leads', value: 940 },
  { label: 'Consultations', value: 610 },
  { label: 'Approved Projects', value: 430 },
  { label: 'Completed Projects', value: 290 },
];



const leadSources = [
  { label: 'Google Ads', value: 38, color: '#5262EE' },
  { label: 'Organic Search', value: 27, color: '#4CDDFF' },
  { label: 'Referrals', value: 18, color: '#9D7EF1' },
  { label: 'Social Media', value: 11, color: '#181819' },
  { label: 'Direct / Other', value: 6, color: '#6B7280' },
];

const leadSourceChartOptions = {
  labels: leadSources.map((i) => i.label),
  datasets: [
    {
      data: leadSources.map((i) => i.value),
      backgroundColor: leadSources.map((i) => i.color),
      borderWidth: 0,
      hoverOffset: 6,
    },
  ],
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
};

const recentActivity = [
  {
    title: "New project approved",
    description: "Basement Waterproofing - Brooklyn, NY",
    when: "2 hours ago",
    daysAgo: 0,
  },
  {
    title: "Invoice paid",
    description: "$18,500 - Smart Home Installation",
    when: "Today",
    daysAgo: 0,
  },
  {
    title: "New lead assigned",
    description: "Foundation Repair - Queens, NY",
    when: "Yesterday",
    daysAgo: 1,
  },
  {
    title: "Project completed",
    description: "Crawl Space Insulation - Long Island",
    when: "2 days ago",
    daysAgo: 2,
  },
];

const ongoingProjects = [
  { client: 'Donald Gardner', email: 'donald.gardner82@mailpro.com', number: '+1 234 567 889', type: 'Waterproofing', status: 'ongoing', daysAgo: 0 },
  { client: 'Matt Rosales', email: 'matt.rosales.dev@outlook.com', number: '+1 234 567 901', type: 'Insulation', status: 'ongoing', daysAgo: 2 },
  { client: 'Michael Hill', email: 'michael.hill.contracts@gmail.com', number: '+1 234 567 455', type: 'Foundation Repair', status: 'ongoing', daysAgo: 4 },
  { client: 'Nancy Flanary', email: 'n.flannary.builds@yahoo.com', number: '+1 234 567 332', type: 'Waterproofing', status: 'ongoing', daysAgo: 7 },
  { client: 'Joseph Cross', email: 'joseph.cross.projects@icloud.com', number: '+1 234 567 776', type: 'Insulation', status: 'completed', daysAgo: 10 },
  { client: 'Amelia Grant', email: 'amelia.grant@roofmail.com', number: '+1 234 567 111', type: 'Roof Repair', status: 'ongoing', daysAgo: 12 },
  { client: 'Ryan Bell', email: 'ryan.bell@projectworks.com', number: '+1 234 567 222', type: 'Crawl Space', status: 'completed', daysAgo: 16 },
  { client: 'Sofia Parker', email: 'sofia.parker@buildit.net', number: '+1 234 567 333', type: 'Masonry', status: 'ongoing', daysAgo: 19 },
  { client: 'Noah Brooks', email: 'noah.brooks@insulateplus.com', number: '+1 234 567 444', type: 'Insulation', status: 'ongoing', daysAgo: 22 },
  { client: 'Liam Stone', email: 'liam.stone@foundfix.com', number: '+1 234 567 555', type: 'Foundation Repair', status: 'completed', daysAgo: 28 },
  { client: 'Emma West', email: 'emma.west@homecare.org', number: '+1 234 567 666', type: 'Waterproofing', status: 'ongoing', daysAgo: 34 },
  { client: 'Lucas Kent', email: 'lucas.kent@projectmail.io', number: '+1 234 567 777', type: 'Drainage', status: 'ongoing', daysAgo: 41 },
];

const FILTER_OPTIONS = ['Today', 'Past 7 Days', 'Past 30 Days', 'This Month'];
const SCALE_BY_FILTER = {
  'Today': 0.35,
  'Past 7 Days': 0.75,
  'Past 30 Days': 1,
  'This Month': 1.15,
};

const formatReadableDate = (isoDate) => {
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
};
const toIso = (date) => date.toISOString().slice(0, 10);
const dayDiff = (startIso, endIso) => {
  const start = new Date(`${startIso}T00:00:00`);
  const end = new Date(`${endIso}T00:00:00`);
  const diff = Math.floor((end - start) / (1000 * 60 * 60 * 24));
  return Math.max(diff + 1, 1);
};
const formatMetric = (value, type) => {
  if (type === 'currency') return `$${Math.round(value).toLocaleString()}`;
  if (type === 'percent') return `${Number(value).toFixed(1)}%`;
  return Math.round(value).toLocaleString();
};

const MainView = () => {
  const today = useMemo(() => new Date(), []);
  const [startDate, setStartDate] = useState(toIso(new Date(today.getFullYear(), today.getMonth(), 1)));
  const [endDate, setEndDate] = useState(toIso(today));
  const [draftStartDate, setDraftStartDate] = useState(startDate);
  const [draftEndDate, setDraftEndDate] = useState(endDate);
  const [dateMenuResetKey, setDateMenuResetKey] = useState(0);
  const [leadsFilter, setLeadsFilter] = useState('Today');
  const [funnelFilter, setFunnelFilter] = useState('Today');
  const [sourceFilter, setSourceFilter] = useState('Today');
  const [currentPage, setCurrentPage] = useState(1);

  const rowsPerPage = 5;
  const rangeDays = useMemo(() => dayDiff(startDate, endDate), [startDate, endDate]);
  const rangeScale = useMemo(() => Math.max(0.25, Math.min(1.35, rangeDays / 30)), [rangeDays]);

  const setPresetRange = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    const startIso = toIso(start);
    const endIso = toIso(end);
    setStartDate(startIso);
    setEndDate(endIso);
    setDraftStartDate(startIso);
    setDraftEndDate(endIso);
    setDateMenuResetKey((prev) => prev + 1);
  };

  const applyCustomRange = () => {
    if (!draftStartDate || !draftEndDate || draftStartDate > draftEndDate) return;
    setStartDate(draftStartDate);
    setEndDate(draftEndDate);
    setDateMenuResetKey((prev) => prev + 1);
  };

  const dashboardSummary = useMemo(() => 
  summaryCards.map((card) => {
    const value = card.baseValue * rangeScale;

    // const noteValue =
      // card.valueType === 'percent'
        // ? (card.noteBase * rangeScale).toFixed(1)
        // : Math.round(card.noteBase * rangeScale);

    return {
      ...card,
      valueText: (
        <span className="metric-value">
          {formatMetric(value, card.valueType)}
        </span>
      ),
      noteText: (
        <span className="metric-note">
          <span className={`metric-note-prefix ${card.notePrefix?.className || ""}`}>
            {card.notePrefix?.content}
          </span>
          <span className={`metric-note-value ${card.noteBase?.className || ""}`}>
            {card.noteBase?.content}
          </span>
          <span className={`metric-note-suffix ${card.noteSuffix?.className || ""}`}>
            {card.noteSuffix?.content}
          </span>
        </span>
      ),
    };
  }), 
  [rangeScale]
);

  const leadsChartData = useMemo(() => {
    const scale = (SCALE_BY_FILTER[leadsFilter] || 1) * rangeScale;
    return {
      ...leadsByMonth,
      datasets: [{
        ...leadsByMonth.datasets[0],
        data: leadsByMonth.datasets[0].data.map((val) => Math.round(val * scale)),
      }],
    };
  }, [leadsFilter, rangeScale]);

  const filteredFunnels = useMemo(() => {
    const scale = (SCALE_BY_FILTER[funnelFilter] || 1) * rangeScale;
    return funnelData.map((item) => ({ ...item, value: Math.round(item.value * scale) }));
  }, [funnelFilter, rangeScale]);

  const funnelChartData = {
    labels: filteredFunnels.map((i) => i.label),
    datasets: [
      {
        data: filteredFunnels.map((i) => i.value),
        backgroundColor: filteredFunnels.map(
          (_, i) => `#2EA7DF`
        ),
        borderRadius: 2,
        barThickness: 9,
      },
    ],
  };
  const funnelChartOptions = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
  
    plugins: {
      legend: { display: false },
    },
  
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
  
        ticks: {
          color: "#C7CCD0",   // ⭐ X-axis numbers color          
          font: {
            size: 11,
            weight: "400",
          },
        },
      },
  
      y: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          padding: 1,
          color: "#000000",   // ⭐ Y-axis label color (stage names)
          font: {
            size: 12,
            weight: "400",
          },
        },
      },
    },
  };
  const filteredLeadSources = useMemo(() => {
    const scale = (SCALE_BY_FILTER[sourceFilter] || 1) * rangeScale;
    return leadSources.map((item) => ({ ...item, value: Math.max(1, Math.round(item.value * scale)) }));
  }, [sourceFilter, rangeScale]);

  const leadSourceChart = useMemo(() => ({
    labels: filteredLeadSources.map((source) => source.label),
    datasets: [{
      data: filteredLeadSources.map((source) => source.value),
      backgroundColor: filteredLeadSources.map((source) => source.color),
      borderWidth: 0,
      cutout: '68%',
    }],
  }), [filteredLeadSources]);

  const funnelMax = Math.max(...filteredFunnels.map((item) => item.value));
  const filteredProjects = useMemo(() => ongoingProjects.filter((row) => row.daysAgo < rangeDays), [rangeDays]);
  const filteredActivity = useMemo(() => recentActivity.filter((row) => row.daysAgo < rangeDays), [rangeDays]);

  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / rowsPerPage));
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredProjects.slice(start, start + rowsPerPage);
  }, [currentPage, filteredProjects]);

  useEffect(() => {
    setCurrentPage(1);
  }, [rangeDays]);

  const downloadBlob = (content, type, filename) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = () => {
    const header = 'Client,Email,Number,Project Type,Project Status\n';
    const rows = filteredProjects
      .map((row) => [row.client, row.email, row.number, row.type, row.status].map((v) => `"${v}"`).join(','))
      .join('\n');
    downloadBlob(`${header}${rows}`, 'text/csv;charset=utf-8;', 'ongoing-projects.csv');
  };

  const handleExportPdf = () => {
    const content = [
      'ZavzaSeal - Ongoing Projects (Dummy Export)',
      '------------------------------------------',
      ...filteredProjects.map((row, i) => `${i + 1}. ${row.client} | ${row.type} | ${row.status}`),
    ].join('\n');
    downloadBlob(content, 'application/pdf', 'ongoing-projects.pdf');
  };

  const startRow = filteredProjects.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endRow = Math.min(currentPage * rowsPerPage, filteredProjects.length);

  return (
    <Fragment>
      <MDBContainer fluid className="dashboard-mdb py-3 px-2 px-md-0">
        <MDBCard className="date-range-card">
          <MDBCardBody className="flex-column flex-md-row card-body d-flex align-items-start align-md-items-center justify-content-between py-2 px-3">
            <p className="mb-0 d-flex align-items-center gap-2">
              <svg width="20" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19.2113 1.65854C19.1214 1.58854 19.0168 1.53992 18.9054 1.51636C18.7939 1.49281 18.6786 1.49494 18.5681 1.5226L12.8372 2.9551L7.08563 0.0788546C6.92537 -0.00107695 6.74181 -0.0210294 6.56812 0.0226047L0.568125 1.5226C0.40587 1.56316 0.261827 1.65679 0.158889 1.7886C0.0559514 1.92042 2.53226e-05 2.08286 0 2.2501V15.7501C1.72544e-05 15.8641 0.0260054 15.9765 0.0759907 16.0789C0.125976 16.1814 0.198644 16.271 0.288475 16.3412C0.378306 16.4113 0.482937 16.46 0.594422 16.4837C0.705907 16.5073 0.821313 16.5052 0.931875 16.4776L6.66281 15.0451L12.4144 17.9214C12.5188 17.9728 12.6336 17.9998 12.75 18.0001C12.8113 18.0001 12.8724 17.9925 12.9319 17.9776L18.9319 16.4776C19.0941 16.437 19.2382 16.3434 19.3411 16.2116C19.444 16.0798 19.5 15.9174 19.5 15.7501V2.2501C19.5 2.13603 19.474 2.02346 19.424 1.92095C19.374 1.81844 19.3012 1.7287 19.2113 1.65854ZM7.5 1.96323L12 4.21323V16.037L7.5 13.787V1.96323ZM1.5 2.83604L6 1.71104V13.6642L1.5 14.7892V2.83604ZM18 15.1642L13.5 16.2892V4.33604L18 3.21104V15.1642Z" fill="#04161F"/></svg>

              <span>Current Range ({formatReadableDate(startDate)} - {formatReadableDate(endDate)})</span>
            </p>
            <MDBDropdown key={dateMenuResetKey}>
              <MDBDropdownToggle color="link" className="m-0 p-0 text-dark text-capitalize d-flex align-items-center gap-2">
                <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.5 1.5H14.25V0.75C14.25 0.551088 14.171 0.360322 14.0303 0.21967C13.8897 0.0790176 13.6989 0 13.5 0C13.3011 0 13.1103 0.0790176 12.9697 0.21967C12.829 0.360322 12.75 0.551088 12.75 0.75V1.5H5.25V0.75C5.25 0.551088 5.17098 0.360322 5.03033 0.21967C4.88968 0.0790176 4.69891 0 4.5 0C4.30109 0 4.11032 0.0790176 3.96967 0.21967C3.82902 0.360322 3.75 0.551088 3.75 0.75V1.5H1.5C1.10218 1.5 0.720644 1.65804 0.43934 1.93934C0.158035 2.22064 0 2.60218 0 3V18C0 18.3978 0.158035 18.7794 0.43934 19.0607C0.720644 19.342 1.10218 19.5 1.5 19.5H16.5C16.8978 19.5 17.2794 19.342 17.5607 19.0607C17.842 18.7794 18 18.3978 18 18V3C18 2.60218 17.842 2.22064 17.5607 1.93934C17.2794 1.65804 16.8978 1.5 16.5 1.5ZM3.75 3V3.75C3.75 3.94891 3.82902 4.13968 3.96967 4.28033C4.11032 4.42098 4.30109 4.5 4.5 4.5C4.69891 4.5 4.88968 4.42098 5.03033 4.28033C5.17098 4.13968 5.25 3.94891 5.25 3.75V3H12.75V3.75C12.75 3.94891 12.829 4.13968 12.9697 4.28033C13.1103 4.42098 13.3011 4.5 13.5 4.5C13.6989 4.5 13.8897 4.42098 14.0303 4.28033C14.171 4.13968 14.25 3.94891 14.25 3.75V3H16.5V6H1.5V3H3.75ZM16.5 18H1.5V7.5H16.5V18Z" fill="black"/></svg>

                <span>Choose Date Range</span>
              </MDBDropdownToggle>
              <MDBDropdownMenu className="date-range-menu p-3">
                <div className="d-flex flex-wrap gap-2 mb-3">
                  <MDBBtn size="sm" color="light" onClick={() => setPresetRange(0)}>Today</MDBBtn>
                  <MDBBtn size="sm" color="light" onClick={() => setPresetRange(6)}>Past 7 Days</MDBBtn>
                  <MDBBtn size="sm" color="light" onClick={() => setPresetRange(29)}>Past 30 Days</MDBBtn>
                </div>
                <MDBInput type="date" size="sm" className="mb-2" label="Start date" value={draftStartDate} onChange={(e) => setDraftStartDate(e.target.value)} />
                <MDBInput type="date" size="sm" className="mb-3" label="End date" value={draftEndDate} onChange={(e) => setDraftEndDate(e.target.value)} />
                <MDBBtn size="sm" onClick={applyCustomRange}>Apply</MDBBtn>
              </MDBDropdownMenu>
            </MDBDropdown>
          </MDBCardBody>
        </MDBCard>

        <MDBRow className="g-3 mb-3">
          <MDBCol xl="6" lg="7">
            <MDBRow className="g-3">
              {dashboardSummary.map((card) => (
                <MDBCol md="6" key={card.title}>
                  <MDBCard className="summary-card h-100">
                    <MDBCardBody>
                      <div className="summary-title d-flex align-items-center gap-2 mb-2">
                        <span className="summary-icon">{card.icon}</span>
                        <span>{card.title}</span>
                      </div>
                      <h4 className="mb-1 fw-bold">{card.valueText}</h4>
                      <p className={`mb-0 summary-note ${card.noteType}`}>{card.noteText}</p>
                    </MDBCardBody>
                  </MDBCard>
                </MDBCol>
              ))}
            </MDBRow>
          </MDBCol>

          <MDBCol xl="6" lg="5">
            <MDBCard className="h-100">              
              <MDBCardBody className="">
                <MDBCardHeader className="d-flex justify-content-between align-items-cente border-0 p-0 bg-transparent">
                  <span className="fw-semibold d-flex align-items-center gap-2"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 19C24 20.654 22.654 22 21 22V23C21 23.553 20.553 24 20 24C19.447 24 19 23.553 19 23V22H18.732C17.665 22 16.669 21.426 16.134 20.501C15.857 20.022 16.021 19.411 16.498 19.135C16.977 18.856 17.589 19.022 17.864 19.499C18.043 19.809 18.375 20 18.731 20H20.999C21.551 20 21.999 19.552 21.999 19C21.999 18.621 21.728 18.302 21.354 18.239L18.314 17.733C16.972 17.509 15.999 16.359 15.999 15C15.999 13.346 17.345 12 18.999 12V11C18.999 10.447 19.446 10 19.999 10C20.552 10 20.999 10.447 20.999 11V12H21.267C22.334 12 23.33 12.574 23.865 13.499C24.142 13.978 23.978 14.589 23.501 14.865C23.021 15.143 22.41 14.977 22.135 14.501C21.956 14.191 21.624 14 21.268 14H19C18.448 14 18 14.448 18 15C18 15.379 18.271 15.698 18.645 15.761L21.685 16.267C23.027 16.491 24 17.641 24 19ZM19 2H18V1C18 0.447 17.553 0 17 0C16.447 0 16 0.447 16 1V2H8V1C8 0.447 7.553 0 7 0C6.447 0 6 0.447 6 1V2H5C2.243 2 0 4.243 0 7V19C0 21.757 2.243 24 5 24H14C14.553 24 15 23.553 15 23C15 22.447 14.553 22 14 22H5C3.346 22 2 20.654 2 19V10H17C17.553 10 18 9.553 18 9C18 8.447 17.553 8 17 8H2V7C2 5.346 3.346 4 5 4H19C20.654 4 22 5.346 22 7V9C22 9.553 22.447 10 23 10C23.553 10 24 9.553 24 9V7C24 4.243 21.757 2 19 2Z" fill="black"/></svg> Leads View</span>
                  <MDBDropdown group>
                    <MDBDropdownToggle color="link" className="text-capitalize p-0 text-muted small d-flex align-items-center gap-2"><svg width="12" height="13" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11 1H9.5V0.5C9.5 0.367392 9.44732 0.240215 9.35355 0.146447C9.25979 0.0526784 9.13261 0 9 0C8.86739 0 8.74021 0.0526784 8.64645 0.146447C8.55268 0.240215 8.5 0.367392 8.5 0.5V1H3.5V0.5C3.5 0.367392 3.44732 0.240215 3.35355 0.146447C3.25979 0.0526784 3.13261 0 3 0C2.86739 0 2.74021 0.0526784 2.64645 0.146447C2.55268 0.240215 2.5 0.367392 2.5 0.5V1H1C0.734784 1 0.48043 1.10536 0.292893 1.29289C0.105357 1.48043 0 1.73478 0 2V12C0 12.2652 0.105357 12.5196 0.292893 12.7071C0.48043 12.8946 0.734784 13 1 13H11C11.2652 13 11.5196 12.8946 11.7071 12.7071C11.8946 12.5196 12 12.2652 12 12V2C12 1.73478 11.8946 1.48043 11.7071 1.29289C11.5196 1.10536 11.2652 1 11 1ZM2.5 2V2.5C2.5 2.63261 2.55268 2.75979 2.64645 2.85355C2.74021 2.94732 2.86739 3 3 3C3.13261 3 3.25979 2.94732 3.35355 2.85355C3.44732 2.75979 3.5 2.63261 3.5 2.5V2H8.5V2.5C8.5 2.63261 8.55268 2.75979 8.64645 2.85355C8.74021 2.94732 8.86739 3 9 3C9.13261 3 9.25979 2.94732 9.35355 2.85355C9.44732 2.75979 9.5 2.63261 9.5 2.5V2H11V4H1V2H2.5ZM11 12H1V5H11V12Z" fill="#646464"></path></svg> {leadsFilter}</MDBDropdownToggle>
                    <MDBDropdownMenu>
                      {FILTER_OPTIONS.map((option) => (
                        <MDBDropdownItem key={option} link onClick={() => setLeadsFilter(option)}>{option}</MDBDropdownItem>
                      ))}
                    </MDBDropdownMenu>
                  </MDBDropdown>
                </MDBCardHeader>
                <div className="bar-wrap pt-4">
                  <Bar data={leadsChartData} options={leadsByMonthOptions} />
                </div>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>

        <MDBRow className="g-4 my-4">
          <MDBCol className="mt-0" lg="4">
            <MDBCard className="h-100">              
              <MDBCardBody>
              <MDBCardHeader className="d-flex justify-content-between align-items-center bg-transparent border-0 p-0">
                <span className="fw-semibold">Project Funnels</span>
                <MDBDropdown group>
                  <MDBDropdownToggle color="link" className="text-capitalize p-0 text-muted small d-flex align-items-center gap-2"><svg width="12" height="13" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11 1H9.5V0.5C9.5 0.367392 9.44732 0.240215 9.35355 0.146447C9.25979 0.0526784 9.13261 0 9 0C8.86739 0 8.74021 0.0526784 8.64645 0.146447C8.55268 0.240215 8.5 0.367392 8.5 0.5V1H3.5V0.5C3.5 0.367392 3.44732 0.240215 3.35355 0.146447C3.25979 0.0526784 3.13261 0 3 0C2.86739 0 2.74021 0.0526784 2.64645 0.146447C2.55268 0.240215 2.5 0.367392 2.5 0.5V1H1C0.734784 1 0.48043 1.10536 0.292893 1.29289C0.105357 1.48043 0 1.73478 0 2V12C0 12.2652 0.105357 12.5196 0.292893 12.7071C0.48043 12.8946 0.734784 13 1 13H11C11.2652 13 11.5196 12.8946 11.7071 12.7071C11.8946 12.5196 12 12.2652 12 12V2C12 1.73478 11.8946 1.48043 11.7071 1.29289C11.5196 1.10536 11.2652 1 11 1ZM2.5 2V2.5C2.5 2.63261 2.55268 2.75979 2.64645 2.85355C2.74021 2.94732 2.86739 3 3 3C3.13261 3 3.25979 2.94732 3.35355 2.85355C3.44732 2.75979 3.5 2.63261 3.5 2.5V2H8.5V2.5C8.5 2.63261 8.55268 2.75979 8.64645 2.85355C8.74021 2.94732 8.86739 3 9 3C9.13261 3 9.25979 2.94732 9.35355 2.85355C9.44732 2.75979 9.5 2.63261 9.5 2.5V2H11V4H1V2H2.5ZM11 12H1V5H11V12Z" fill="#646464"></path></svg> {funnelFilter}</MDBDropdownToggle>
                  <MDBDropdownMenu>
                    {FILTER_OPTIONS.map((option) => (
                      <MDBDropdownItem key={option} link onClick={() => setFunnelFilter(option)}>{option}</MDBDropdownItem>
                    ))}
                  </MDBDropdownMenu>
                </MDBDropdown>
              </MDBCardHeader>
                <div className="bar-wrap pt-4">
                  <Bar data={funnelChartData} options={funnelChartOptions} />
                </div>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>

          <MDBCol className="mt-0" lg="4">
            <MDBCard className="h-100">              
              <MDBCardBody>
                <MDBCardHeader className="d-flex justify-content-between align-items-center bg-transparent border-0 p-0">
                  <span className="fw-semibold">Lead Sources</span>
                  <MDBDropdown group>
                    <MDBDropdownToggle color="link" className="text-capitalize p-0 text-muted small d-flex align-items-center gap-2"><svg width="12" height="13" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11 1H9.5V0.5C9.5 0.367392 9.44732 0.240215 9.35355 0.146447C9.25979 0.0526784 9.13261 0 9 0C8.86739 0 8.74021 0.0526784 8.64645 0.146447C8.55268 0.240215 8.5 0.367392 8.5 0.5V1H3.5V0.5C3.5 0.367392 3.44732 0.240215 3.35355 0.146447C3.25979 0.0526784 3.13261 0 3 0C2.86739 0 2.74021 0.0526784 2.64645 0.146447C2.55268 0.240215 2.5 0.367392 2.5 0.5V1H1C0.734784 1 0.48043 1.10536 0.292893 1.29289C0.105357 1.48043 0 1.73478 0 2V12C0 12.2652 0.105357 12.5196 0.292893 12.7071C0.48043 12.8946 0.734784 13 1 13H11C11.2652 13 11.5196 12.8946 11.7071 12.7071C11.8946 12.5196 12 12.2652 12 12V2C12 1.73478 11.8946 1.48043 11.7071 1.29289C11.5196 1.10536 11.2652 1 11 1ZM2.5 2V2.5C2.5 2.63261 2.55268 2.75979 2.64645 2.85355C2.74021 2.94732 2.86739 3 3 3C3.13261 3 3.25979 2.94732 3.35355 2.85355C3.44732 2.75979 3.5 2.63261 3.5 2.5V2H8.5V2.5C8.5 2.63261 8.55268 2.75979 8.64645 2.85355C8.74021 2.94732 8.86739 3 9 3C9.13261 3 9.25979 2.94732 9.35355 2.85355C9.44732 2.75979 9.5 2.63261 9.5 2.5V2H11V4H1V2H2.5ZM11 12H1V5H11V12Z" fill="#646464"/></svg> {sourceFilter}</MDBDropdownToggle>
                    <MDBDropdownMenu>
                      {FILTER_OPTIONS.map((option) => (
                        <MDBDropdownItem key={option} link onClick={() => setSourceFilter(option)}>{option}</MDBDropdownItem>
                      ))}
                    </MDBDropdownMenu>
                  </MDBDropdown>
                </MDBCardHeader>
                <div className="d-flex align-items-center gap-3 pt-4 flex-column flex-md-row">                  
                  <div className="lead-source-list">
                    {filteredLeadSources.map((source) => (
                      <div className="source-row" key={source.label}>
                        <span className="source-dot" style={{ backgroundColor: source.color }} />
                        <span>{source.label} - <span className="green">{source.value}%</span></span>                        
                      </div>
                    ))}
                  </div>
                  <div className="donut-wrap">
                    <Pie data={leadSourceChart} options={leadSourceChartOptions} />
                  </div>
                </div>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>

          <MDBCol className="mt-0" lg="4">
            <MDBCard className="h-100">              
              <MDBCardBody className="">
                <MDBCardHeader className="fw-semibold bg-transparent border-0 p-0 d-flex align-items-center justify-content-space-between">Recent Activity <a href="#" className="recent-link">See all</a></MDBCardHeader>
                    <div className="d-flex flex-column gap-2 pt-4">
                    {filteredActivity.map((activity) => (
                      <div className="activity-row" key={activity.text}>                    
                        <p className="mb-0"><span className="green"> • {activity.title}:</span> <span className="text-black">{activity.description}</span></p>
                        <small>{activity.when}</small>
                      </div>
                    ))}
                    {filteredActivity.length === 0 && (
                      <div className="activity-row">
                        <p className="mb-0">No activity in selected range.</p>
                      </div>
                    )}
                  </div>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>

        <MDBCard className="mb-3">         
          <MDBCardBody>
          <MDBCardHeader className="d-flex justify-content-between align-items-center bg-transparent border-0 p-0 gap-3 flex-column flex-md-row">
            <span className="fw-semibold">Ongoing Projects</span>
            <div className="d-flex gap-3">
              <MDBBtn size="sm" color="light" className="text-capitalize d-flex align-items-center gap-2 btn-export-table" onClick={handleExportCsv}>
              <svg width="10" height="12" viewBox="0 0 10 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.5 0H4.5C3.1215 0 2 1.1215 2 2.5V7.5C2 8.8785 3.1215 10 4.5 10H7.5C8.8785 10 10 8.8785 10 7.5V2.5C10 1.1215 8.8785 0 7.5 0ZM9 7.5C9 8.327 8.327 9 7.5 9H4.5C3.673 9 3 8.327 3 7.5V2.5C3 1.673 3.673 1 4.5 1H7.5C8.327 1 9 1.673 9 2.5V7.5ZM7.5 11.5C7.5 11.7765 7.276 12 7 12H2.5C1.1215 12 0 10.8785 0 9.5V3.5C0 3.2235 0.224 3 0.5 3C0.776 3 1 3.2235 1 3.5V9.5C1 10.327 1.673 11 2.5 11H7C7.276 11 7.5 11.2235 7.5 11.5ZM5 7V7.5C5 7.7765 4.776 8 4.5 8C4.224 8 4 7.7765 4 7.5V7C4 6.7235 4.224 6.5 4.5 6.5C4.776 6.5 5 6.7235 5 7ZM8 6.5V7.5C8 7.7765 7.776 8 7.5 8C7.224 8 7 7.7765 7 7.5V6.5C7 6.2235 7.224 6 7.5 6C7.776 6 8 6.2235 8 6.5ZM6.5 6V7.5C6.5 7.7765 6.276 8 6 8C5.724 8 5.5 7.7765 5.5 7.5V6C5.5 5.7235 5.724 5.5 6 5.5C6.276 5.5 6.5 5.7235 6.5 6ZM8 2.5V3.6515C8 3.9615 7.625 4.117 7.406 3.8975L7.108 3.5995L6.3535 4.354C6.256 4.4515 6.128 4.5005 6 4.5005C5.872 4.5005 5.744 4.4515 5.6465 4.354L5.25 3.9575L4.8535 4.354C4.658 4.5495 4.342 4.5495 4.1465 4.354C3.951 4.1585 3.951 3.8425 4.1465 3.647L4.8965 2.897C5.092 2.7015 5.408 2.7015 5.6035 2.897L6 3.2935L6.401 2.8925L6.103 2.5945C5.884 2.3755 6.039 2.0005 6.349 2.0005H7.5005C7.7765 2.0005 8.0005 2.2245 8.0005 2.5005L8 2.5Z" fill="black"/></svg> Export Reports</MDBBtn>  
              <MDBBtn size="sm" color="light" className="text-capitalize d-flex align-items-center gap-2 btn-export-table" onClick={handleExportPdf}>
              <svg width="11" height="13" viewBox="0 0 11 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.72292 3.00083L7.8325 1.11042C7.1175 0.395417 6.16417 0 5.15125 0H2.70833C1.21333 0 0 1.21333 0 2.70833V10.2917C0 11.7867 1.21333 13 2.70833 13H8.125C9.62 13 10.8333 11.7867 10.8333 10.2917V5.68208C10.8333 4.66917 10.4379 3.71583 9.72292 3.00083ZM8.95917 3.76458C9.1325 3.93792 9.27875 4.1275 9.39792 4.33333H7.04708C6.74917 4.33333 6.50542 4.08958 6.50542 3.79167V1.44083C6.71125 1.56 6.90083 1.70625 7.07417 1.87958L8.96458 3.77L8.95917 3.76458ZM9.75 10.2917C9.75 11.1854 9.01875 11.9167 8.125 11.9167H2.70833C1.81458 11.9167 1.08333 11.1854 1.08333 10.2917V2.70833C1.08333 1.81458 1.81458 1.08333 2.70833 1.08333H5.15125C5.23792 1.08333 5.33 1.08333 5.41667 1.09417V3.79167C5.41667 4.68542 6.14792 5.41667 7.04167 5.41667H9.73917C9.75 5.50333 9.75 5.59 9.75 5.68208V10.2917ZM2.75708 7.04167H2.16667C1.86875 7.04167 1.625 7.28542 1.625 7.58333V9.98833C1.625 10.1779 1.77667 10.3242 1.96083 10.3242C2.145 10.3242 2.29667 10.1725 2.29667 9.98833V9.3275H2.75167C3.39083 9.3275 3.91083 8.81292 3.91083 8.18458C3.91083 7.55625 3.39083 7.04167 2.75167 7.04167H2.75708ZM2.75708 8.65042H2.3075V7.71875H2.7625C3.0225 7.71875 3.24458 7.93 3.24458 8.18458C3.24458 8.43917 3.0225 8.65042 2.7625 8.65042H2.75708ZM9.21917 7.38292C9.21917 7.5725 9.0675 7.71875 8.88333 7.71875H7.96792V8.33625H8.63958C8.82917 8.33625 8.97542 8.48792 8.97542 8.67208C8.97542 8.85625 8.82375 9.00792 8.63958 9.00792H7.96792V9.98292C7.96792 10.1725 7.81625 10.3188 7.63208 10.3188C7.44792 10.3188 7.29625 10.1671 7.29625 9.98292V7.3775C7.29625 7.18792 7.44792 7.04167 7.63208 7.04167H8.88333C9.07292 7.04167 9.21917 7.19333 9.21917 7.3775V7.38292ZM5.46542 7.04708H4.875C4.57708 7.04708 4.33333 7.29083 4.33333 7.58875V9.99375C4.33333 10.1833 4.485 10.2971 4.66917 10.2971C4.85333 10.2971 5.46 10.2971 5.46 10.2971C6.09917 10.2971 6.61917 9.7825 6.61917 9.15417V8.19C6.61917 7.56167 6.09917 7.04708 5.46 7.04708H5.46542ZM5.9475 9.15417C5.9475 9.40875 5.72542 9.62 5.46542 9.62H5.01583V7.72417H5.47083C5.73083 7.72417 5.95292 7.93542 5.95292 8.19V9.15417H5.9475Z" fill="#646464"/></svg> Export PDF</MDBBtn>
            </div>
          </MDBCardHeader>
            <MDBTable hover small responsive className="mt-4 ongoing-table">
              <MDBTableHead>
                <tr>
                  <th className="bg-transparent">Client</th>
                  <th className="bg-transparent">Email</th>
                  <th className="bg-transparent">Number</th>
                  <th className="bg-transparent">Project Type</th>
                  <th className="bg-transparent">Project Status</th>
                  <th className="text-end bg-transparent">Actions</th>
                </tr>
              </MDBTableHead>     
              <MDBTableBody>
                {paginatedProjects.map((row) => (
                  <tr key={row.email}>
                    <td className="bg-transparent">{row.client}</td>
                    <td className="bg-transparent">{row.email}</td>
                    <td className="bg-transparent">{row.number}</td>
                    <td className="bg-transparent">{row.type}</td>
                    <td className="bg-transparent">
                      <span className={`status-badge ${row.status}`}>{row.status}</span>
                    </td>
                    <td className="text-end bg-transparent text-muted">
                      <span className="d-flex align-items-center justify-content-end gap-3">
                        <a href="#"><svg width="10" height="12" viewBox="0 0 10 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.33333 0.666667H7L6.33333 0H3L2.33333 0.666667H0V2H9.33333V0.666667ZM0.666667 10.6667C0.666667 11.0203 0.807142 11.3594 1.05719 11.6095C1.30724 11.8595 1.64638 12 2 12H7.33333C7.68696 12 8.02609 11.8595 8.27614 11.6095C8.52619 11.3594 8.66667 11.0203 8.66667 10.6667V2.66667H0.666667V10.6667Z" fill="black" fill-opacity="0.3"/></svg></a>
                        <span className="sep">|</span>
                        <a href="#"><svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.8067 2.695C12.0667 2.435 12.0667 2.00167 11.8067 1.755L10.2467 0.195C10 -0.065 9.56667 -0.065 9.30667 0.195L8.08 1.415L10.58 3.915L11.8067 2.695ZM0 9.50167V12.0017H2.5L9.87333 4.62167L7.37333 2.12167L0 9.50167Z" fill="black" fill-opacity="0.3"/></svg></a>
                      </span>
                    </td>
                  </tr>
                ))}
                {paginatedProjects.length === 0 && (
                  <tr>
                    <td colSpan="6" className="bg-transparent text-center text-muted py-4">No projects in selected range.</td>
                  </tr>
                )}
              </MDBTableBody>
            </MDBTable>

            <div className="d-flex justify-content-between align-items-center table-footer">
              <small>{`${String(startRow).padStart(2, '0')}-${String(endRow).padStart(2, '0')} of ${filteredProjects.length}`}</small>
              <div className="pagination-chip">
                <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}><svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.94977 0.353516L0.707127 4.59616L4.94977 8.8388" stroke="#DDDDDD" stroke-opacity="0.866667"/><path d="M8.94977 0.353516L4.70713 4.59616L8.94977 8.8388" stroke="#DDDDDD" stroke-opacity="0.866667"/></svg></button>
                <div className="d-flex align-items-center gap-0">
                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
                    <button key={page} type="button" className={page === currentPage ? 'active page-count' : 'page-count'} onClick={() => setCurrentPage(page)}>{page}</button>
                  ))} 
                </div>
                <button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}><svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.24267 8.83887L12.4853 4.59623L8.24267 0.353586" stroke="#DDDDDD" stroke-opacity="0.866667"/><path d="M4.24267 8.83887L8.48531 4.59623L4.24267 0.353586" stroke="#DDDDDD" stroke-opacity="0.866667"/></svg></button>
              </div>
            </div>
          </MDBCardBody>
        </MDBCard>
      </MDBContainer>
    </Fragment>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(MainView);
