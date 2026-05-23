# check_calendar_events.rb
puts "=== CALENDAR EVENTS ==="
CalendarEvent.where(workflow_state: 'active').each do |e|
  puts "  [ID: #{e.id}] Title: '#{e.title}', Context: '#{e.context_code}', Start: '#{e.start_at}', End: '#{e.end_at}'"
end

puts "\n=== ASSIGNMENTS ==="
Assignment.where(workflow_state: 'published').each do |a|
  puts "  [ID: #{a.id}] Title: '#{a.title}', Context: '#{a.context_type}_#{a.context_id}', Due: '#{a.due_at}'"
end
