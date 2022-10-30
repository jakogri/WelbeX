import {React, Component } from 'react';
import axios from 'axios';

class App extends Component {
  constructor(props) {
      super(props);
      this.state = {
         table: {},
         rows_count: 0,
         field: 'obj_name', 
         conditions: [],
         getTable: false,
         field_value: '',
         operation:'', 
         table_loc: [],
         pg_buttons: [],
         pg_buttons_count: 0
      };
     this.conditions_name = [
      <select placeholder={'Условие'} onChange = {this.handleChangeOperation}>
      <option value='>'>Больше</option>
      <option value='<'>Меньше</option>
      <option value='='>Равно</option>
      <option value='like'>Содержит</option>
      </select> ];
     this. conditions_number = [
      <select placeholder={'Условие'}  onChange = {this.handleChangeOperation}>
      <option value='>'>Больше</option>
      <option value='<'>Меньше</option>
      <option value='='>Равно</option>
      </select> 
     ]  
    this.state.conditions = this.conditions_name;
  }
  
  //Устанавка кнопок пагинации
  setPgButons = async(n) =>{
    let loc_pg_buttons = [];
    for(let i = 1; i <= this.state.pg_butons_count; i++){
     let loc_button = [];
     if (n == i) loc_button = [<button type="button" style={{borderColor:'red'}} name={i.toString()} onClick={this.setPage} >{i.toString()}</button>];
     else loc_button = [<button type="button" style={{borderColor:'black'}} name={i.toString()} onClick={this.setPage} >{i.toString()}</button>];
     loc_pg_buttons.push(loc_button);
    }
    this.setState({pg_butons: loc_pg_buttons});
  }

  // Переход на нужную страницу по кнопкам пагинации 
  setPage = async(event) =>{
    let curpage = parseInt(event.target.name, 10);
    await this.setTableLoc((curpage-1)*6); 
    await this.setPgButons(curpage);
    this.render(); 
  }

  //Заполненин текущей страницы
  setTableLoc = async(start_rou) =>{
    let table1 = []
    for(let i = start_rou; i < ((start_rou + 6)<this.state.rows_count?start_rou + 6:this.state.rows_count); i++){
      let str = [
        <tr>
            <td>{this.state.table.rows[i].obj_date.slice(0,10)}</td>
            <td>{this.state.table.rows[i].obj_name}</td> 
            <td>{this.state.table.rows[i].count.toString()}</td>
            <td>{this.state.table.rows[i].distance.toString()}</td>
        </tr>
      ]
      console.log(str);
      table1.push(str);
    }
    this.setState({table_loc: table1});
  }

  //Выбор таблицы из базы данных
  getTable = async() =>{
   axios({
    method: 'post',
    url: '/api/list',
    params: {
     name: this.state.field,
     operation: this.state.operation,
     value: this.state.field_value
    },
    data: {
    },
    headers: {
     "Content-type": "application/json; charset=UTF-8"
    }
    })
    .then(res => {
      this.setState({table: res.data});
      this.setState({rows_count: res.data.rowCount});
      this.setState({pg_butons_count: Math.ceil(res.data.rowCount/6)})
      this.setTableLoc(0);
      this.setPgButons(1);
      this.render();
    }).catch(err => {
     console.log(err);
    })
  }  

  //Реакция на кнопку перезагрузки таблицы 
  handleChangeGetTable = async(event) =>{
  this.setState({ getTable: true});
  this.getTable();
  this.setState({ getTable: false});
  }  

  // Реакция на выбор поля в фильтре
 handleChangeField = async(event) =>{
   this.setState({field: event.target.value});
    if (event.target.value == 'obj_name')
     this.state.conditions = this.conditions_name;
    else this.state.conditions = this.conditions_number; 
    this.render();
  }

  //Реакция на выбор условия в фильтре
  handleChangeOperation = async(event) =>{
    this.setState({operation: event.target.value});
   }
  
  //Реакция на выбор значения поля в фильтре
  handleChangeFieldVale = async(event) =>{
    let help_value;
    let i;
    if (this.state.field == 'count'){
      help_value = '';  
      for(i = 0; i < event.target.value.length; i++){
        if (/^[0-9]*$/.test(event.target.value[i]) === true)
            help_value += event.target.value[i];
      }
      event.target.value = help_value
    }
    else if (this.state.field == 'distance'){
      help_value = '';  
      for(i = 0; i < event.target.value.length; i++){
        if (/^[0-9\.]*$/.test(event.target.value[i]) === true)
            help_value += event.target.value[i];
      }
      event.target.value = help_value
    } 
   this.setState({field_value: event.target.value});  
  }

  render() {
     return(
      <div>
      <div style={{display: 'flex',  justifyContent:'center', alignItems:'center'}}>
       <input type='checkbox' name='getTable' id = 'getTable'  onClick={this.handleChangeGetTable} checked = {this.state.getTable} onwheel="this.blur()"/>
       <label type="hlabel">Обновление таблицы</label>
       <pre>{'  '}</pre>
       <select placeholder={'Поле'} onChange = {this.handleChangeField} name = 'field'>
       <option value='obj_name'>Название</option>
       <option value='count'>Количество</option>
       <option value='distance'>Расстояние</option>
       </select>
       {this.state.conditions}    
       <input type='text' name='field_value' value={this.state.field_value} onChange = {this.handleChangeFieldVale}/>
       </div>
       <br/>
      <div style={{display: 'flex',  justifyContent:'center', alignItems:'center'}}>
      <table border={2} cols = {4}  >
      <thead>
      <tr>
       <th>Дата</th>
       <th>Название</th>
       <th>Количество</th>
       <th>Расстояние</th>
       </tr>
       </thead>
       <tbody>
       {this.state.table_loc} 
       </tbody>
      </table>
      </div>  
      <br/>
      <div style={{display: 'flex',  justifyContent:'center', alignItems:'center'}}>
      {this.state.pg_butons}  
      </div>
      </div>    
     )
  }; 

  async componentDidMount() {
   await this.getTable();
  } 
}
export default App;
