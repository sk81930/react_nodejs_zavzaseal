import React, {  Fragment, useEffect, useState } from 'react';
import { connect } from "react-redux";
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import { MDBRipple } from 'mdb-react-ui-kit';


import {
} from "../../../constants/actionTypes";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';


const mapStateToProps = (state) => ({
  	...state,
  	loginData: state.auth.loginData,
  	currentUser: state.auth.currentUser,
});

const mapDispatchToProps = (dispatch) => ({
});



const MainView = (props) => {

	const { currentUser } = props;

  const [chartHome, setChartHome] = useState(null);

  useEffect(() => {

      setChartHome({
        labels: ['Kitchen', 'Bedroom' , 'Living room'],
        datasets: [
          {
            label: 'Traffic',
            data: [3300,2400,1700],
            backgroundColor: ['rgb(47 183 245)', 'rgb(174 230 255)', 'rgb(2 119 189)'],
          },
        ],
      });
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

	return (
		<Fragment>
			<div className="grid flex-1 auto-cols-fr gap-y-8 homes dashboard">

                <section className="container px-0 position-relative">
                  <div className="home_wrapper py-5 px-3" style={{ background: "#0277BD"}}>
                      <div className="row">
                          <div className="home_wrap" style={{marginBottom: "-110px"}}>
                              <div className="d-flex align-items-start flex-wrap">
                                  <div className="col me-lg-5 me-md-2 me-2 bg-body-tertiary rounded-3 py-4 px-2"> 
                                      <div className="inner_card d-flex">
                                          <div className="inner_img rounded-3 d-flex justify-content-center align-items-center">
                                              <img src={require("../../../assets/images/vector_1.png")} alt="" />
                                          </div>
                                          <div className="inner_content ms-3">
                                              <p className="leading-6 mb-0">Temperature</p>
                                              <h3 className="mb-0 text-3xl font-bold">25<span className="text-xl font-normal ms-1">°c</span></h3>
                                          </div>
                                      </div>
                                  </div>
                                    <div className="col me-lg-5 me-md-2 me-2 bg-body-tertiary rounded-3 py-4 px-2"> <div className="inner_card d-flex">
                                          <div className="inner_img rounded-3 d-flex justify-content-center align-items-center">
                                              <img src={require("../../../assets/images/Vector_2.png")} alt="" />
                                          </div>
                                          <div className="inner_content ms-3">
                                              <p className="leading-6 mb-0">Air quality</p>
                                              <h3 className="mb-0 text-3xl font-bold">97<span className="text-xl font-normal ms-1">%</span></h3>
                                          </div>
                                      </div>
                                    </div>
                                    <div className="col bg-body-tertiary rounded-3 py-4 px-2"> <div className="inner_card d-flex">
                                          <div className="inner_img rounded-3 d-flex justify-content-center align-items-center">
                                             <img src={require("../../../assets/images/Vector_3.png")} alt="" />
                                          </div>
                                          <div className="inner_content ms-3">
                                              <p className="leading-6 mb-0">Humidity</p>
                                              <h3 className="mb-0 text-3xl font-bold">60<span className="text-xl font-normal ms-1">%</span></h3>
                                          </div>
                                      </div>
                                    </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </section>
              <section className="container px-0 position-relative">
                  <div className="tab_wrapper" style={{marginTop: "102px"}}>
                      <div className="row">
                          <div className="col-lg-8  col-md-7">
                              <div className="tab_wrap p-4 rounded-3 bg-white">
                                  <Tabs
                								      defaultActiveKey="KITCHEN"
                								      id="uncontrolled-tab-example"
                								      className="mb-4"
                								    >
              								      <Tab eventKey="KITCHEN" title="KITCHEN">
              									      <img
              									        src={require("../../../assets/images/Rectangle10.png")}
              									        className='img-fluid rounded w-100'
              									        alt='example'
              									      />
              								      </Tab>
              								      <Tab eventKey="profile" title="BEDROOM">
              								        <img
              									        src={require("../../../assets/images/bedroom.png")}
              									        className='img-fluid rounded w-100'
              									        alt='example'
              									      />
              								      </Tab>
              								      <Tab eventKey="contact" title="LIVING ROOM">
              								        <img
              									        src={require("../../../assets/images/livingroom.png")}
              									        className='img-fluid rounded w-100'
              									        alt='example'
              									      />
              								      </Tab>
              								    </Tabs> 
                              </div>
                          </div>
                        
                        <div className="col-lg-4 col-md-5">
                            <div className="side_wrap rounded-3 bg-white">
                                <div className="header_wrap py-3 px-4">
                                    <h4 className="mb-0 text-sm font-semibold">Energy consumption by room</h4>
                                </div> 
                                <div className="side_content">
                                    {chartHome && (
                                      <div className="chart-1 w-100">
                                        <div className="w-100 d-flex justify-content-center pt-5 pb-5">
                                          <div style={{ width: '350px', height: '350px' }}>
                                            <Pie data={chartHome} options={options} />
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                </div>
                            </div>
                        </div>
                      </div>
                  </div>
              </section>
            </div>
		</Fragment>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(MainView);