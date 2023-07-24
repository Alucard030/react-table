import React, { useEffect, useReducer } from "react";
import "./style.css";
import makeData from "./makeData";
import Table from "./Table";
import Cell from "./Cell";
import Header from "./Header";
import { randomColor, shortId } from "./utils";
import { grey } from "./colors";



function doAdd(tableState,action){
  const state=JSON.parse(JSON.stringify(tableState));
  const doSearch=(col,i)=>{
    const addId = shortId();
    if(col.id==action.columnId &&col.columns==undefined){
      console.log('1')
      return {
          Header:Header,
          id:col.id,
          label:col.label,
          columns:[
            {
              Header:Header,
              id: addId,
              label: "Column"+addId,
              accessor: addId,
              dataType: "text",
              created: action.focus && true,
              options: []
            }
          ],
          accessor:col.id
      }
    } else if (col.id==action.columnId &&col.columns!=undefined){
      col.columns=[...col.columns,{
        Header:Header,
        id: addId,
        label: "Column"+addId,
        accessor: addId,
        dataType: "text",
        created: action.focus && true,
        options: []
      }]
      return {...col,Header:Header,id:col.id,accessor:col.id};
    } else if(col.columns==undefined){
      return col
    } else{
      return {...col,columns:col.columns.map(doSearch),Header:Header,id:col.id,accessor:col.id};
    }
  }

  
  const newColumns=state.columns.map(doSearch);

 
 
  return {...tableState,columns:newColumns};
}

const addDefaults=(col)=>{
  const newCol=JSON.parse(JSON.stringify(col));
  const id=shortId();
  if(!newCol.id) newCol.id=id;
  if(!newCol.accessor) newCol.accessor=id;
  newCol.Header=Header;
  if(newCol.columns)
  return {...newCol,columns:newCol.columns.map(addDefaults),Header:Header,id:newCol.id,accessor:newCol.id};
  return newCol;
};

function reducer(state, action) {
  switch (action.type) {
    case "add_option_to_column":
      const optionIndex = state.columns.findIndex(
        (column) => column.id === action.columnId
      );
      return {
        ...state,
        skipReset: true,
        columns: [
          ...state.columns.slice(0, optionIndex),
          {
            ...state.columns[optionIndex],
            options: [
              ...state.columns[optionIndex].options,
              { label: action.option, backgroundColor: action.backgroundColor }
            ]
          },
          ...state.columns.slice(optionIndex + 1, state.columns.length)
        ]
      };
    case "add_row":
      return {
        ...state,
        skipReset: true,
        data: [...state.data, {}]
      };
    case "update_column_type":
      const typeIndex = state.columns.findIndex(
        (column) => column.id === action.columnId
      );
      switch (action.dataType) {
        case "number":
          if (state.columns[typeIndex].dataType === "number") {
            return state;
          } else {
            return {
              ...state,
              columns: [
                ...state.columns.slice(0, typeIndex),
                { ...state.columns[typeIndex], dataType: action.dataType },
                ...state.columns.slice(typeIndex + 1, state.columns.length)
              ],
              data: state.data.map((row) => ({
                ...row,
                [action.columnId]: isNaN(row[action.columnId])
                  ? ""
                  : Number.parseInt(row[action.columnId])
              }))
            };
          }
        case "select":
          if (state.columns[typeIndex].dataType === "select") {
            return {
              ...state,
              columns: [
                ...state.columns.slice(0, typeIndex),
                { ...state.columns[typeIndex], dataType: action.dataType },
                ...state.columns.slice(typeIndex + 1, state.columns.length)
              ],
              skipReset: true
            };
          } else {
            let options = [];
            state.data.forEach((row) => {
              if (row[action.columnId]) {
                options.push({
                  label: row[action.columnId],
                  backgroundColor: randomColor()
                });
              }
            });
            return {
              ...state,
              columns: [
                ...state.columns.slice(0, typeIndex),
                {
                  ...state.columns[typeIndex],
                  dataType: action.dataType,
                  options: [...state.columns[typeIndex].options, ...options]
                },
                ...state.columns.slice(typeIndex + 1, state.columns.length)
              ],
              skipReset: true
            };
          }
        case "text":
          if (state.columns[typeIndex].dataType === "text") {
            return state;
          } else if (state.columns[typeIndex].dataType === "select") {
            return {
              ...state,
              skipReset: true,
              columns: [
                ...state.columns.slice(0, typeIndex),
                { ...state.columns[typeIndex], dataType: action.dataType },
                ...state.columns.slice(typeIndex + 1, state.columns.length)
              ]
            };
          } else {
            return {
              ...state,
              skipReset: true,
              columns: [
                ...state.columns.slice(0, typeIndex),
                { ...state.columns[typeIndex], dataType: action.dataType },
                ...state.columns.slice(typeIndex + 1, state.columns.length)
              ],
              data: state.data.map((row) => ({
                ...row,
                [action.columnId]: row[action.columnId] + ""
              }))
            };
          }
        default:
          return state;
      }
    case "update_column_header":
      const index = state.columns.findIndex(
        (column) => column.id === action.columnId
      );
      return {
        ...state,
        skipReset: true,
        columns: [
          ...state.columns.slice(0, index),
          { ...state.columns[index], label: action.label },
          ...state.columns.slice(index + 1, state.columns.length)
        ]
      };
    case "update_cell":
      return {
        ...state,
        skipReset: true,
        data: state.data.map((row, index) => {
          if (index === action.rowIndex) {
            return {
              ...state.data[action.rowIndex],
              [action.columnId]: action.value
            };
          }
          return row;
        })
      };
    case "add_column_to_left":
      const leftIndex = state.columns.findIndex(
        (column) => column.id === action.columnId
      );
      let leftId = shortId();
      return {
        ...state,
        skipReset: true,
        columns: [
          ...state.columns.slice(0, leftIndex),
          {
            id: leftId,
            label: "Column"+leftId,
            accessor: leftId,
            dataType: "text",
            created: action.focus && true,
            options: []
          },
          ...state.columns.slice(leftIndex, state.columns.length)
        ]
      };
    case "add_column_to_right":{
      const rightIndex = state.columns.findIndex(
        (column) => column.id === action.columnId
      );
      const rightId = shortId();
      return {
        ...state,
        skipReset: true,
        columns: [
          ...state.columns.slice(0, rightIndex + 1),
          {
            id: rightId,
            label: "Column"+rightId,
            accessor: rightId,
            dataType: "text",
            created: action.focus && true,
            options: []
          },
          ...state.columns.slice(rightIndex + 1, state.columns.length)
        ]
      };}
      case "add_subheader":
        // const addIndex = state.columns.findIndex(
        //   (column) => column.id === action.columnId
        // );
        // const oldId=state.columns[addIndex].id;
        // const addId = shortId();
        // console.log(state);
        // const newColumn={
        //   Header:Header,
        //   id:oldId,
        //   label:state.columns[addIndex].label,
        //   columns:state.columns[addIndex].columns??[],
        //   accessor:oldId
        // }
        // newColumn.columns.push({
        //   id: addId,
        //   label: "Column",
        //   accessor: addId,
        //   dataType: "text",
        //   created: action.focus && true,
        //   options: []
        // })
        // return {
        //   ...state,
        //   skipReset: true,
        //   columns: [
        //     ...state.columns.slice(0, addIndex ),
        //     newColumn,
        //     ...state.columns.slice(addIndex+1 , state.columns.length)
        //   ]
        // };
        return doAdd(state,action);
    case "update_fields":
      return {...state,columns:state.columns.map(addDefaults)};
    case "delete_column":
      const deleteIndex = state.columns.findIndex(
        (column) => column.id === action.columnId
      );
      return {
        ...state,
        skipReset: true,
        columns: [
          ...state.columns.slice(0, deleteIndex),
          ...state.columns.slice(deleteIndex + 1, state.columns.length)
        ]
      };
    case "enable_reset":
      return {
        ...state,
        skipReset: false
      };
    default:
      return state;
  }
}

function App() {
  const [state, dispatch] = useReducer(reducer, makeData(0));

  useEffect(() => {
    dispatch({ type: "enable_reset" });
  }, [state.data, state.columns]);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflowX: "hidden"
      }}
    >
      <div
        style={{
          height: 120,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column"
        }}
      >
        <h1 style={{ color: grey(800) }}>Editable React Table</h1>
      </div>
      <div style={{ overflow: "auto", display: "flex" }}>
        <div
          style={{
            flex: "1 1 auto",
            padding: "1rem",
            maxWidth: 1000,
            marginLeft: "auto",
            marginRight: "auto"
          }}
        >
          <Table
            columns={state.columns}
            data={state.data}
            dispatch={dispatch}
            skipReset={state.skipReset}
          />
        </div>
      </div>
      <div
        style={{
          height: 140,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column"
        }}
      >
        <p style={{ color: grey(600) }}>
          Built by{" "}
          <a
            href="https://twitter.com/thesysarch"
            style={{ color: grey(600), fontWeight: 600 }}
          >
            @thesysarch
          </a>
        </p>
      </div>
    </div>
  );
}

export default App;
