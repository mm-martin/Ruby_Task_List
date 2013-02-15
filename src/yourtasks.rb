require 'sinatra'
require 'sinatra/reloader'
require 'data_mapper'
require 'time'

DataMapper::setup(:default, "sqlite3://#{Dir.pwd}/recall.db")

class Task
	puts "Creating task class"
	include DataMapper::Resource
	property :id, Serial
	property :summary, Text, :required => true
	property :status, Integer, :required => true
	property :rank, Integer, :required => true
	property :created_at, DateTime
	property :updated_at, DateTime
end

class Status
	puts "Creating status class"
	include DataMapper::Resource
	property :id, Serial
	property :status, String
end

DataMapper.auto_upgrade!

UP = -1
DOWN = 1

def bump_rank(direction, shifttask)
	neighbour = Task.first(:rank => (shifttask.rank + direction)) #direction decides whether to swap with the task ranked immediately below or above.
	if neighbour != nil && (shifttask.rank != 0 || shifttask.rank != Task.max(:rank)) # if our task isn't already ranked highest or lowest.
		shifttask.rank, neighbour.rank = neighbour.rank, shifttask.rank #parallel assignment, values swap. How cool is that!
		shifttask.save
		neighbour.save
	end
end

stats = Status.all
puts "Stats: "+stats.length.to_s()


get '/' do
	puts "get: #{params}"
	@tasks = Task.all :order => :rank.asc
	@statuses = Status.all :order => :id.asc
	@title = 'All Tasks'
	@createdates = Array.new()
	erb :newhome
end

post '/' do
	puts "post: "+params[:summary].to_s()
	t = Task.new
	t.summary = params[:summary]
	t.status = 0
	if(Task.count == 0)
		t.rank = 0
	else
		t.rank = Task.max(:rank) +1
	end
	t.created_at = Time.now
	t.updated_at = Time.now
	t.save
	redirect '/'
end

get '/:id' do
	puts ":id: #{params[:id]}"
	@task = Task.get params[:id]
	@statuses = Status.all :order => :id.asc
	@title = "Edit task ##{params[:id]}"
	erb :edit
end

put '/:id' do
	puts "put id"
	t = Task.get params[:id]
	t.summary = params[:summary]
	t.status = params[:status]
	t.rank = params[:rank]
	t.updated_at = Time.now
	t.save
	redirect '/'
end

get '/:id/delete' do
	puts "get id delete"
	@task = Task.get params[:id]
	@title = "Confirm deletion of task ##{params[:id]}"
	erb :delete
end

delete '/:id' do
	puts "delete id"
	t = Task.get params[:id]
	t.destroy
	redirect '/'
end

get '/:id/complete' do
	puts "complete"
	n = Task.get params[:id]
	n.complete = n.complete ? 0 : 1 # flip it
	n.updated_at = Time.now
	n.save
	redirect '/'
end

get '/up/:id' do
	puts 'Up!'
	t = Task.get params[:id]
	bump_rank(UP, t)
	# change_rank(UP, Task.get params[:id])
	# downtask = Task.first(:rank => (uptask.rank - 1))
	# if uptask.rank != 0 && downtask != nil #if our task isn't already ranked highest
	# 	uptask.rank = uptask.rank - 1
	# 	downtask.rank = downtask.rank + 1
	# 	uptask.save
	# 	downtask.save
	# end
	redirect '/'
end

get '/down/:id' do
	puts 'Down!'
	t = Task.get params[:id]
	bump_rank(DOWN, t)
	# downtask = Task.get params[:id]
	# uptask = task.first(:rank => (uptask.rank + 1))
	redirect '/'
end


