# BaseResponse

## Example

```go
import "ModEd/core"

	core.SendResponse(context, core.BaseApiResponse{
		IsSuccess: true,
		Status:    200,
		Message:   "",
		Result:    map[string]string{"data": "value"},
	})
```
