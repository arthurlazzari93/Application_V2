
import React from "react";
// react plugin that prints a given react component

// react component for creating dynamic tables
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import ToolkitProvider, { Search } from "react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit";
// react component used to create sweet alerts

// reactstrap components
import {


  Card,
  CardHeader,
  Container,
  Row,

} from "reactstrap";
// core components
import SimpleHeader from "components/Headers/SimpleHeader.js";

import { dataTable } from "variables/general";

const pagination = paginationFactory({
  page: 1,
  alwaysShowAllBtns: true,
  showTotal: true,
  withFirstAndLast: false,
  sizePerPageRenderer: ({ onSizePerPageChange }) => (
    <div className="dataTables_length" id="datatable-basic_length">
      <label>
        Show{" "}
        {
          <select
            name="datatable-basic_length"
            aria-controls="datatable-basic"
            className="form-control form-control-sm"
            onChange={(e) => onSizePerPageChange(e.target.value)}
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        }{" "}
        entries.
      </label>
    </div>
  ),
});

const { SearchBar } = Search;

function ReactBSTables() {
  const [alert] = React.useState(null);
  
  // this function will copy to clipboard an entire table,
  // so you can paste it inside an excel or csv file


  return (
    <>
      {alert}
      <SimpleHeader name="React Tables" parentName="Tables" />
      <Container className="mt--6" fluid>
        <Row>
          <div className="col">
            <Card>
              <CardHeader>
                <h3 className="mb-0">React Bootstrap Table 2</h3>
                <p className="text-sm mb-0">
                  This is an exmaple of data table using the well known
                  react-bootstrap-table2 plugin. This is a minimal setup in
                  order to get started fast.
                </p>
              </CardHeader>
              <ToolkitProvider
                data={dataTable}
                keyField="name"
                columns={[
                  {
                    dataField: "name",
                    text: "Name",
                    sort: true,
                  },
                  {
                    dataField: "position",
                    text: "Position",
                    sort: true,
                  },
                  {
                    dataField: "office",
                    text: "Office",
                    sort: true,
                  },
                  {
                    dataField: "age",
                    text: "Age",
                    sort: true,
                  },
                  {
                    dataField: "start_date",
                    text: "Start date",
                    sort: true,
                  },
                  {
                    dataField: "salary",
                    text: "Salary",
                    sort: true,
                  },
                ]}
                search
              >
                {(props) => (
                  <div className="py-4 table-responsive">
                    <div
                      id="datatable-basic_filter"
                      className="dataTables_filter px-4 pb-1"
                    >
                      <label>
                        Search:
                        <SearchBar
                          className="form-control-sm"
                          placeholder=""
                          {...props.searchProps}
                        />
                      </label>
                    </div>
                    <BootstrapTable
                      {...props.baseProps}
                      bootstrap4={true}
                      pagination={pagination}
                      bordered={false}
                    />
                  </div>
                )}
              </ToolkitProvider>
            </Card>
          </div>
        </Row>
      </Container>
    </>
  );
}

export default ReactBSTables;
