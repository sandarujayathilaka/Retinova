

const PersonalDetails = () => (
    <CardContent className="p-8">
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSave)}  className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 font-medium flex items-center">
                <User2 className="h-5 w-5 mr-2 text-blue-600" />
                Full Name
              </FormLabel>
              <FormControl>
                <Input {...field} className="h-12 rounded-xl border-gray-300 bg-white shadow-sm" disabled={!isEditing} />
              </FormControl>
            </FormItem>
          )} />

          {/* NIC */}
          <FormField control={form.control} name="nic" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 font-medium flex items-center">
                <User2 className="h-5 w-5 mr-2 text-blue-600" />
                NIC Number
              </FormLabel>
              <FormControl>
                <Input {...field} className="h-12 rounded-xl border-gray-300 bg-white shadow-sm" disabled={!isEditing} />
              </FormControl>
            </FormItem>
          )} />

          {/* Birth Date */}
          <FormField 
control={form.control} 
name="birthDate" 
render={({ field }) => (
<FormItem>
<FormLabel className="text-gray-700 font-medium flex items-center">
<CalendarIcon className="h-5 w-5 mr-2 text-blue-600" />
Date of Birth
</FormLabel>
<FormControl>
<Input
type="date"
value={field.value ? new Date(field.value).toISOString().split("T")[0] : ""}
onChange={(e) => field.onChange(e.target.value)}
className="h-12 rounded-xl border-gray-300 bg-white shadow-sm"
disabled={!isEditing}
/>
</FormControl>
</FormItem>
)}
/>


          {/* Gender */}
          <FormField control={form.control} name="gender" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 font-medium flex items-center">
                <Circle className="h-5 w-5 mr-2 text-blue-600" />
                Gender
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={!isEditing}>
                <FormControl>
                  <SelectTrigger className="h-12 rounded-xl border-gray-300 bg-white shadow-sm">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )} />

          {/* Phone Number */}
          <FormField control={form.control} name="phoneNumber" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 font-medium flex items-center">
                <Smartphone className="h-5 w-5 mr-2 text-blue-600" />
                Phone Number
              </FormLabel>
              <FormControl>
                <Input {...field} className="h-12 rounded-xl border-gray-300 bg-white shadow-sm" disabled={!isEditing} />
              </FormControl>
            </FormItem>
          )} />

          {/* Email Address */}
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 font-medium flex items-center">
                <Mail className="h-5 w-5 mr-2 text-blue-600" />
                Email Address
              </FormLabel>
              <FormControl>
                <Input {...field} className="h-12 rounded-xl border-gray-300 bg-white shadow-sm" disabled={!isEditing} />
              </FormControl>
            </FormItem>
          )} />

          {/* Address */}
          <FormField control={form.control} name="address" render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel className="text-gray-700 font-medium flex items-center">
                <Home className="h-5 w-5 mr-2 text-blue-600" />
                Full Address
              </FormLabel>
              <FormControl>
                <Input {...field} className="h-12 rounded-xl border-gray-300 bg-white shadow-sm" disabled={!isEditing} />
              </FormControl>
            </FormItem>
          )} />
        </div>

        <Separator className="my-8 bg-gray-200" />

        <div className="flex justify-center gap-4">
        {isEditing ? (
<>
<Button 
type="submit"
className="h-12 px-8 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-lg hover:shadow-xl transition-all"
>
<Save className="h-5 w-5 mr-2" />
Save Changes
</Button>
<Button
type="button"
onClick={() => setIsEditing(false)}
className="h-12 px-8 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 shadow-sm hover:shadow-md transition-all"
>
<X className="h-5 w-5 mr-2 text-gray-600" />
Cancel
</Button>
</>
) : (
<>
<Button 
type="button" 
onClick={handleEditToggle}
className="h-12 px-8 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white shadow-lg hover:shadow-xl transition-all"
>
<Pencil className="h-5 w-5 mr-2" />
Edit Patient
</Button>

<Button
type="button"
onClick={() => window.history.back()}
className="h-12 px-8 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 shadow-sm hover:shadow-md transition-all"
>
<ArrowLeft className="h-5 w-5 mr-2 text-gray-600" />
Back
</Button>

</>
)}
</div>

      </form>
    </Form>
  </CardContent>
  );
  export default PersonalDetails;