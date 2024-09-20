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
    <input class="w-full bg-blue-500 text-white font-bold py-2 px-2 rounded" type="submit" value="Add Todo" id="submit" />
  </form>
  <div class="space-y-1 py-4 px-0">
  ${todos.map((todo, index) => {
    return html`
    <div class="flex flex-row rounded bg-blue-100 px-2 space-x-2">
      <input type="checkbox" id="todoItem-${index}" data-id=${todo.id} name="todoItem" />
      <label class="w-full" for="todoItem-${index}">
      ${todo.description}
      </label>
  </div>
  `
  } )
 }
</div>
<div> 
 <input ?hidden=${todos.length == 0} class="w-full bg-red-500 text-white font-bold py-2 px-4 rounded" type="button" id="delete" value="delete"/>
</div>
`;

class App extends HTMLElement {

  /** 
   * @type {Todo[]}
   */
  #all = [];
  /** 
   * @type {Todo[]}
   */
  #selected = [];

  constructor() {
    super();
  }

  /**
   * @param {Todo[]} list 
   */
  set todos(list) {
    this.#all = [...list];
    this.render();
  }

  addTodo(todo){
    this.todos = [...this.#all, todo];
  }

  render(){
    render(template({
      todos: this.#all,
      selectedTodos: this.#selected
    }), this);
    this.querySelector("#delete").toggleAttribute("disabled", this.#all.length == 0, true);
    [...this.querySelectorAll("input[name=todoItem]")].forEach(x => {
      if([...this.#selected].map(y => y.id).includes(x.dataset.id)){
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
    this.render();
    this.querySelector("#todo").addEventListener("input", e => this.render());
    this.querySelector("#todo").addEventListener("change", e => this.render());
    this.querySelector("#submit").addEventListener('click', _ => {
      let id = self.crypto.randomUUID();
      var description = this.querySelector("#todo").value;
      this.querySelector("#todo").value = "";
      this.addTodo({id, description});
    }
    );
    
    this.querySelector("#delete").addEventListener("click", _ => {
      let checkboxes = this.querySelectorAll("input[type=checkbox][name=todoItem]:checked");
      const ids = [...checkboxes].map(x=>x.dataset.id);
      this.#all = this.#all.filter(x => !ids.includes(x.id));
      this.#selected = this.#selected.filter(x => this.todos.includes(x));
      this.render();
    }); 
  }
}
  
customElements.define("td-app", App);
export default App;
