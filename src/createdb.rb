require 'data_mapper'

summaries = 	["Add new projects through the admin interface.",
				"Add sub projects through the admin interface.",
				"Select a different Project from a drop down when giving feedback.",
				"Select a different sub project from a drop down when giving feedback on a project.",
				"Click on help link to view annotated screens explaining the interface",
				"Restrict export option to admin and production?",
				"Delete an image after it's been attached it to an entry.",
				"Delete an entry after it's been submitted.",
				"Automagically detect what build you are playing when giving feedback",
				"Capture and attach a screenshot of what's on your screen in real time.",
				"Integrate with a system that helps people manage and rank their tasks."]

status_names = ['To Do', 'In Progress', 'Complete']

puts "here!"

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

DataMapper.auto_migrate!

summaries.each_with_index do |summary, index|
	t = Task.create(
		:summary => summary,
		:status => 0,
		:rank => index,
		:created_at => Time.now,
		:updated_at => Time.now)
	puts t.to_s()
	t.save
end

status_names.each do |status_name|
	s = Status.new
	s.status = status_name
	puts s.to_s()
	s.save
end