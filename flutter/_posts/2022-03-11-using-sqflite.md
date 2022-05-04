---
post_id: sqflite
---

## Import package

Add the sqflite package in the pubspec.yaml dependencies. Add the path_provider package too, we will use it for the join function.

{% highlight yaml %}
dependencies:
  flutter:
    sdk: flutter
  sqflite: ^2.0.2
  path_provider: ^2.0.9
{% endhighlight %}

<!--more-->


<br>
## Open the database

I will use a custom class with the name “Task” to store in the database. It has some attributes, a constructor to initialize the class from a map, and a function to convert the class to a map.

{% highlight dart %}
enum TaskState { pending, completed, deleted }

class Task {
  int? id;
  final String name;
  final DateTime initialDate;
  final DateTime finalDate;
  TaskState taskState;

  Task(this.name, this.initialDate, this.finalDate,
      {this.taskState = TaskState.pending, this.id});

  Task.fromMap(Map<String, Object?> map)
      : id = map['id'] as int,
        name = map['name'] as String,
        initialDate = DateTime.parse(map['initial_date'] as String),
        finalDate = DateTime.parse(map['final_date'] as String),
        taskState = TaskState.values[map['task_state'] as int];

  Map<String, Object?> toMap() => {
        'name': name,
        'initial_date': initialDate.toIso8601String(),
        'final_date': finalDate.toIso8601String(),
        'task_state': taskState.index,
      };
}
{% endhighlight %}

{% highlight dart %}
class Tasks with ChangeNotifier {
  Database? _db;
  List<Task> _tasks = [];

  Future<void> initDatabase() async {
      _db = await openDatabase(
        join(await getDatabasesPath(), 'database.db'),
        onCreate: (database, version) {
          print('onCreate');
          database.execute(
            'CREATE TABLE tasks('
            'id INTEGER PRIMARY KEY AUTOINCREMENT,'
            'name TEXT,'
            'initial_date TEXT,'
            'final_date TEXT,'
            'task_state INTEGER);',
          );
        },
        onOpen: (database) async {
          print('onOpen');
          final List<Map<String, dynamic>> maps = await database.query('tasks');
          final List<Task> taskList = List.generate(
            maps.length,
            (index) => Task.fromMap(maps[index]),
          );
          _tasks = taskList;
          notifyListeners();
        },
      );
  }
}
{% endhighlight %}

We can open the database with the openDatabase function.

* The first argument is the path to the database

* onCreate will be executed when we create the database, that is to say the first time we call openDatabase with this path.

* onOpen will be executed when the database is opened. The first time we call openDatabase, onOpen will be also called after onCreate.


<br>
## Add element

We can add an element with the insert function:

{% highlight dart %}
Future<void> addTask(
      String name, DateTime initialDate, DateTime finalDate) async {
    int id = await _saveTask(Task(name, initialDate, finalDate));
    _tasks.add(Task(name, initialDate, finalDate, id: id));

    notifyListeners();
  }

  Future<int> _saveTask(Task task) async {
    return await _db!.insert('tasks', task.toMap());
  }
{% endhighlight %}

The insert function returns the id the database assigns to the element. We can retrieve that id and assign it to the object.


<br>
## Update element

{% highlight dart %}
Future<void> changeTaskState(int id, TaskState newState) async {
    Task task = _tasks.firstWhere((element) => element.id == id);
    task.taskState = newState;
    await _db!.update('tasks', task.toMap(), where: 'id = ?', whereArgs: [id]);

    notifyListeners();
  }
{% endhighlight %}


<br>
## Remove element

{% highlight dart %}
Future<void> removeTask(int id) async {
    await _db!.delete('tasks', where: 'id = $id');
    _tasks.removeWhere(
      (element) => element.id == id,
    );

    notifyListeners();
  }
{% endhighlight %}