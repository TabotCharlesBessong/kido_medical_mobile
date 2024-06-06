```TSX
<View
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
          marginBottom: 16,
          width: "90%",
          left: 4,
        }}
      >
        <AuthCheckbox
          onPress={() => setMusic(!music)}
          title="Music"
          isChecked={music}
        />
        <AuthCheckbox
          onPress={() => setDancing(!dancing)}
          title="Dancing"
          isChecked={dancing}
        />
        <AuthCheckbox
          onPress={() => setReading(!reading)}
          title="Reading"
          isChecked={reading}
        />
      </View>
      <AuthRadioButton
        options={["Option 1", "Option 2", "Option 3"]}
        activeButton="Option 1"
        onChange={handleRadioButtonChange}
        containerOptions={{ style: { marginVertical: 16 ,display:"flex",flexDirection:"row",alignItems:"center",justifyContent:"space-between"} }}
        buttonStyle={{
          flexDirection: "row",
          alignItems: "center",
          marginVertical: 8,
        }}
        labelStyle={{ marginLeft: 8 }}
        radioSize={24}
      />
      {/* <AppSelect /> */}
      <AuthSelectField
        name="role"
        label="Select User Role"
        options={[
          { label: "Doctor", value: "option1" },
          { label: "Patient", value: "option2" },
          { label: "Nurse", value: "option3" },
        ]}
        containerStyle={{ marginBottom: 16 }}
      />

```
