import faker from "faker";
import {randomColor} from "./utils";

export default function makeData(count) {
  let data = [];
  for (let i = 0; i < count; i++) {
    let row = {

    };
    data.push(row);
  }

  let columns = [
    {
      id: 999999,
      width: 20,
      label: "+",
      disableResizing: true,
      dataType: "null"
    }
  ]
  return {columns: columns, data: data, skipReset: false};
}
