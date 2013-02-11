require 'sinatra'
require 'sinatra/reloader'
require 'data_mapper'

DataMapper::setup(:default, "sqlite3://#{Dir.pwd}/recall.db")

class Task
	puts "Creating task class"
	include DataMapper::Resource
	property :id, Serial
	property :content, Text, :required => true
	property :complete, Boolean, :required => true, :default => 0
	property :created_at, DateTime
	property :updated_at, DateTime
end

class Status
	puts "Creating stat class"
	include DataMapper::Resource
	property :id, Serial
	property :status, String
	property :description, Text 	
end

DataMapper.auto_upgrade!

get '/' do
	@tasks = Task.all :order => :id.desc
	@title = 'All Tasks'
	erb :home
end

post '/' do
	n = Task.new
	n.content = params[:content]
	n.created_at = Time.now
	n.updated_at = Time.now
	n.save
	redirect '/'
end

get '/:id' do
	@task = Task.get params[:id]
	@title = "Edit task ##{params[:id]}"
	erb :edit
end

put '/:id' do
	n = Task.get params[:id]
	n.content = params[:content]
	n.complete = params[:complete] ? 1 : 0
	n.updated_at = Time.now
	n.save
	redirect '/'
end

get '/:id/delete' do
	@task = Task.get params[:id]
	@title = "Confirm deletion of task ##{params[:id]}"
	erb :delete
end

delete '/:id' do
	n = Task.get params[:id]
	n.destroy
	redirect '/'
end

get '/:id/complete' do
	n = Task.get params[:id]
	n.complete = n.complete ? 0 : 1 # flip it
	n.updated_at = Time.now
	n.save
	redirect '/'
end
