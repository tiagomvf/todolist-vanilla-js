import {html,render} from 'lit-html';

/**
 * @typedef Todo
 * @property {string} id
 * @property {string} description
 * @returns 
 */

const template=({todos, selectedTodos}) => html`
<form>
  <h1 class="p-5">Todo List</h1>
  
  <input type="text" id="todo" name="todo" placeholder="Todo">
  <input
    class="bg-blue-500 text-white font-bold py-2 px-4 rounded" type="submit" value="Add Todo" id="submit"
    @click=${ 
      e => {
      let id = self.crypto.randomUUID();
      var description = document.querySelector("#todo").value;
      todoStore.addTodo({id, description});
      document.querySelector("#todo").value = "";
      e.preventDefault();
    }
    }
    >
</form>
${todos.map(todo => {
  return html`<div> 
    <input type="checkbox" id="${todo.id}" name="todoItem"
      @change=${ (e) => { 
      if(e.target.checked)
        todoStore.selectTodo(todo.id);
      else
        todoStore.deselectTodo(todo.id);
      }
      }>
    <label for="${todo.id}">${todo.description}</label>
    </input>
  </div>`
  } )
 }
 
 <input ?hidden=${todoStore.todos.length == 0} class="bg-red-500 text-white font-bold py-2 px-4 rounded" type="button" id="delete" value="delete"
   @click=${ e => {
      let checkboxes = document.querySelectorAll("input[name=todoItem]");
      todoStore.deleteTodos([...checkboxes].filter(x=> x.checked).map(x=>x.id));
   }}>
`;

class TodoStore {
  /**
   * @type {Todo[]}
   */
  todos = [];
  /**
   * @type {Todo[]};
   */
  selectedTodos = [];

  addObserver = (callback) => {
    document.addEventListener("todosChanged", callback)
  }

  /**
   * @param {Todo} todo 
   */
  addTodo(todo) {
    this.todos = [...this.todos, todo]
    console.log(this.todos);
    let eventDict = {todos: this.todos, selectedTodos: this.selectedTodos}
    document.dispatchEvent(new CustomEvent("todosChanged", {detail: eventDict}))
  }

  /**
   * @param {string} id
   */
  deleteTodos(ids) {
    this.todos = this.todos.filter(x => !ids.includes(x.id));
    this.selectedTodos = this.selectedTodos.filter(x=> this.todos.includes(x));
    let eventDict = {todos: this.todos, selectedTodos: this.selectedTodos}
    document.dispatchEvent(new CustomEvent("todosChanged", {detail: eventDict}))
  }

  selectTodo(id){
    let todo = [...this.todos].find(x => x.id == id);
    this.selectedTodos = [...this.selectedTodos, todo]
    let eventDict = {todos: this.todos, selectedTodos: this.selectedTodos}
    document.dispatchEvent(new CustomEvent("todosChanged", {detail: eventDict}))
  }

  deselectTodo(id){
    this.selectedTodos = [...this.selectedTodos].filter(x => x.id != id)
    let eventDict = {todos: this.todos, selectedTodos: this.selectedTodos}
    document.dispatchEvent(new CustomEvent("todosChanged", {detail: eventDict}))
  }
}

const todoStore = new TodoStore();

class App extends HTMLElement {

  constructor() {
    super();
  }

  render({todos, selectedTodos}){
    console.log("rendering", todos, selectedTodos);
    render(template({todos, selectedTodos}), this);
    this.querySelector("#delete").toggleAttribute("disabled", todos.length == 0);
    [...this.querySelectorAll("input[name=todoItem]")].forEach(x => {
      if([...selectedTodos].map(y=>y.id).includes(x.id)){
        x.checked = true;
      }else{
        x.checked = false;
      }
    })
  }

  connectedCallback() {
    let {todos, selectedTodos} = todoStore;
    this.render({todos, selectedTodos});
    todoStore.addObserver((e) => this.render(e.detail));
  }
}
  
customElements.define("td-app", App);
export default App;
