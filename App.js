import {html,render} from 'lit-html';

/**
 * @typedef Todo
 * @property {string} id
 * @property {string} description
 */

const template=({todos, selectedTodos}) => html`
<div class="flex flex-col text-lg">
<form class="space-y-2">
  <h1 class="py-4 text-4xl text-center">Todo List</h1>
  <input class="w-full p-1" type="text" id="todo" name="todo" placeholder="Task description"/>
  <input
    class="w-full bg-blue-500 text-white font-bold py-2 px-2 rounded" type="submit" value="Add Todo" id="submit"
    @click=${ 
      e => {
      let id = self.crypto.randomUUID();
      var description = document.querySelector("#todo").value;
      todoStore.addTodo({id, description});
      document.querySelector("#todo").value = "";
      e.preventDefault();
    }
    }
    />
</form>
<div class="space-y-1 py-4 px-0">
${todos.map(todo => {
  return html`
  <div class="flex flex-row rounded bg-blue-100 px-2 space-x-2">
    <input
      type="checkbox" id="${todo.id}" name="todoItem"
      @change=${ (e) => { 
      if(e.target.checked)
        todoStore.selectTodo(todo.id);
      else
        todoStore.deselectTodo(todo.id);
      }
      }/>
    <label class="w-full" for="${todo.id}">
    ${todo.description}
    </label>
</div>
  `
  } )
 }
</div>
<div> 
 <input ?hidden=${todoStore.todos.length == 0} class="w-full bg-red-500 text-white font-bold py-2 px-4 rounded" type="button" id="delete" value="delete"
   @click=${ e => {
      let checkboxes = document.querySelectorAll("input[name=todoItem]");
      todoStore.deleteTodos([...checkboxes].filter(x=> x.checked).map(x=>x.id));
   }}>
</div>
</div>
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
    render(template({todos, selectedTodos}), this);
    this.querySelector("#delete").toggleAttribute("disabled", todos.length == 0);
    [...this.querySelectorAll("input[name=todoItem]")].forEach(x => {
      if([...selectedTodos].map(y=>y.id).includes(x.id)){
        x.checked = true;
      }else{
        x.checked = false;
      }
    })

    let btnSubmit = this.querySelector("#submit");
    let todoInput = this.querySelector("#todo");
    if(todoInput.value && todoInput.value.length > 0){
        btnSubmit.classList.replace("bg-gray-200", "bg-blue-500");
        btnSubmit.disabled = false;
    }else{
        btnSubmit.classList.replace("bg-blue-500", "bg-gray-200");
        btnSubmit.disabled = true;
    }
  }

  connectedCallback() {
    let {todos, selectedTodos} = todoStore;
    this.render({todos, selectedTodos});
    todoStore.addObserver((e) => this.render(e.detail));
    document.querySelector("#todo").addEventListener("input", e => this.render(todoStore))
    document.querySelector("#todo").addEventListener("change", e => this.render(todoStore))

  }
}
  
customElements.define("td-app", App);
export default App;
