require 'sinatra'
require 'sinatra/reloader'
require 'data_mapper'

DataMapper::setup(:default, "sqlite3://#{Dir.pwd}/recall.db")

class Task
	puts "Creating task class"
	include DataMapper::Resource
	property :id, Serial
	property :summary, Text, :required => true
	property :status, String, :required => true
	property :rank, Integer
	property :created_at, DateTime
	property :updated_at, DateTime
end

class Status
	puts "Creating status class"
	include DataMapper::Resource
	property :id, Serial
	property :status, String
end

DataMapper.auto_migrate!

status_names = ['To Do', 'In Progress', 'Complete']
status_names.each do |status_name|
	puts "adding " + status_name
	s = Status.new
	s.status = status_name
end

# getBottomRank do
# 	# to do: sort by rank ascending and return the last value
# 	return 0
# end

get '/' do
	puts "get"
	@tasks = Task.all :order => :id.desc
	puts "1"
	@title = 'All Tasks'
	puts "2"
	erb :home
	puts "3"
end

post '/' do
	puts "post"
	t = Task.new
	t.summary = params[:summary]
	t.status = 'To Do'
	t.rank = 0
	t.created_at = Time.now
	t.updated_at = Time.now
	t.save
	redirect '/'
end

get '/:id' do
	puts "get id"
	@task = Task.get params[:id]
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
