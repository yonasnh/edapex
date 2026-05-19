user = User.order(:id).first
token = user.access_tokens.create!(purpose: "ClassApex Dev Auto-Generated")
puts "GENERATED_TOKEN=#{token.full_token}"
