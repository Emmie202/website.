//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Admin-Emmie:Test1234@cluster0.aaj7n.mongodb.net/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});


const itemSchema = new mongoose.Schema({
  name: String
})

const Item = mongoose.model("Item", itemSchema);

const task1 = new Item ({
  name: "wash plates!"
})

const task2 = new Item ({
  name: "cook food!"
})

const task3 = new Item ({
  name: "learn code!"
})

const defaultItems = [task1, task2, task3];

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema)



app.get("/", function(req, res) {


  Item.find({}, function(err, result){

  if (result.length === 0) {
    Item.insertMany(defaultItems, function(err){
      if (err){
        console.log(err);
      } else {
        console.log("successfully inserted your documents!");
      }
    });

    res.redirect("/")

  } else {
    res.render("list", {listTitle: "Today", newListItems: result});
  }
  })
});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
    if (!err){
      if (!foundList){
        // Create New list
        const list = new List ({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName)
      } else {
        // Show Existing list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
      }
    }
  })
})


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item ({
    name: itemName
  });

  if (listName ==="Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err){
      if (err) {
        console.log(err);
      } else {
        res.redirect("/");
      }
    })
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if (!err){
        res.redirect("/" + listName);
      }
    })
  }


})

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server has started successfully",this.address().port, app.settings.env);
});
