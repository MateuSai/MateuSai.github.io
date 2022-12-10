---
post_id: load_json_into_dictionary
---

{% highlight gdscript %}
var data: Dictionary
var file: File = File.new()
if file.open("res://assets/weapons.json", File.READ):
	printerr("Error opening weapons json")
data = JSON.parse(file.get_as_text()).result
file.close()
{% endhighlight %}