import React from 'react';
import Layout from '@theme/Layout';

export default function Hello() {
  return (
    <Layout title="Hello" description="Hello React Page">
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '50vh',
          fontSize: '20px',
        }}>
        <p>
          试试修改 <code>pages/helloReact.js</code>，然后保存，页面会重载。
        </p>
          <div className="container">
              <div className="row">
                  <div className="col col--6">
                      <div className="col-demo">6</div>
                  </div>
                  <div className="col col--6">
                      <div className="col-demo">6</div>
                  </div>
              </div>
              <div className="row">
                  <div className="col col--4">
                      <div className="col-demo">4</div>
                  </div>
                  <div className="col col--4">
                      <div className="col-demo">4</div>
                  </div>
                  <div className="col col--4">
                      <div className="col-demo">4</div>
                  </div>
              </div>
              <div className="row">
                  <div className="col col--3">
                      <div className="col-demo">3</div>
                  </div>
                  <div className="col col--3">
                      <div className="col-demo">3</div>
                  </div>
                  <div className="col col--3">
                      <div className="col-demo">3</div>
                  </div>
                  <div className="col col--3">
                      <div className="col-demo">3</div>
                  </div>
              </div>
              <div className="row">
                  <div className="col col--2">
                      <div className="col-demo">2</div>
                  </div>
                  <div className="col col--2">
                      <div className="col-demo">2</div>
                  </div>
                  <div className="col col--2">
                      <div className="col-demo">2</div>
                  </div>
                  <div className="col col--2">
                      <div className="col-demo">2</div>
                  </div>
                  <div className="col col--2">
                      <div className="col-demo">2</div>
                  </div>
                  <div className="col col--2">
                      <div className="col-demo">2</div>
                  </div>
              </div>
              <div className="row">
                  <div className="col col--1">
                      <div className="col-demo">1</div>
                  </div>
                  <div className="col col--1">
                      <div className="col-demo">1</div>
                  </div>
                  <div className="col col--1">
                      <div className="col-demo">1</div>
                  </div>
                  <div className="col col--1">
                      <div className="col-demo">1</div>
                  </div>
                  <div className="col col--1">
                      <div className="col-demo">1</div>
                  </div>
                  <div className="col col--1">
                      <div className="col-demo">1</div>
                  </div>
                  <div className="col col--1">
                      <div className="col-demo">1</div>
                  </div>
                  <div className="col col--1">
                      <div className="col-demo">1</div>
                  </div>
                  <div className="col col--1">
                      <div className="col-demo">1</div>
                  </div>
                  <div className="col col--1">
                      <div className="col-demo">1</div>
                  </div>
                  <div className="col col--1">
                      <div className="col-demo">1</div>
                  </div>
                  <div className="col col--1">
                      <div className="col-demo">1</div>
                  </div>
              </div>
          </div>
      </div>
    </Layout>
  );
}